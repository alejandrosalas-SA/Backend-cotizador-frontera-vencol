USE [INTEGRACION_ACSEL]
GO

-- =============================================================================
--  alertas_setup.sql
--  Ejecutar en SSMS DESPUES de roles_setup.sql.
--  Contiene:
--    1) sp_GetBorradoresPorEmpleado  — borradores de N+ días por empleado
--    2) sp_ExpirarBorradoresVencidos — marca status=3 a borradores de 15+ días
--    3) ALTER SP_ContarSolicitudes   — excluye status=3 (vencidas)
--    4) ALTER SP_ObtenerSolicitudes  — excluye status=3 (vencidas)
-- =============================================================================


-- =============================================================================
-- SECCION 1: sp_GetBorradoresPorEmpleado
--   Retorna todas las solicitudes en borrador (status=0) cuyo propietario
--   (id_usuario = cod_emp del empleado) tenga al menos @DiasMinimos dias
--   desde fecha_emision.
--   Usado por los jobs de alertas: @DiasMinimos=7 (alerta), @DiasMinimos=12 (urgente).
--   Columnas: cod_emp, email, nombre_empleado, id_solicitud, fecha_emision,
--             dias_transcurridos, solicitante_nombre, vehiculo_placa.
-- =============================================================================
CREATE OR ALTER PROCEDURE [COTIZ].[sp_GetBorradoresPorEmpleado]
    @DiasMinimos INT = 7
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.cod_emp,
        u.email,
        u.nombre + ' ' + u.apellido                            AS nombre_empleado,
        s.id                                                   AS id_solicitud,
        s.fecha_emision,
        DATEDIFF(day, s.fecha_emision, GETDATE())              AS dias_transcurridos,
        ISNULL(sol.nombre, '(Sin solicitante)')                AS solicitante_nombre,
        ISNULL(veh.placa,  '(Sin vehículo)')                   AS vehiculo_placa
    FROM [COTIZ].[SOLICITUDES] s
    JOIN [COTIZ].[USUARIOS] u
        ON u.cod_emp = s.id_usuario
    LEFT JOIN [COTIZ].[SOLICITUDES_SOLICITANTE] sol
        ON sol.id = s.id
    LEFT JOIN [COTIZ].[SOLICITUDES_VEHICULO] veh
        ON veh.id = s.id
    WHERE s.status = 0
      AND DATEDIFF(day, s.fecha_emision, GETDATE()) >= @DiasMinimos
    ORDER BY u.cod_emp, DATEDIFF(day, s.fecha_emision, GETDATE()) DESC;
END
GO


-- =============================================================================
-- SECCION 2: sp_ExpirarBorradoresVencidos
--   Marca como vencidas (status=3) todas las solicitudes en borrador (status=0)
--   que tengan 15 o mas dias desde fecha_emision.
--   Retorna el numero de filas afectadas como 'solicitudes_expiradas'.
-- =============================================================================
CREATE OR ALTER PROCEDURE [COTIZ].[sp_ExpirarBorradoresVencidos]
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [COTIZ].[SOLICITUDES]
    SET status = 3
    WHERE status = 0
      AND DATEDIFF(day, fecha_emision, GETDATE()) >= 15;

    SELECT @@ROWCOUNT AS solicitudes_expiradas;
END
GO


-- =============================================================================
-- SECCION 3: ALTER SP_ContarSolicitudes
--   Agrega exclusion de status=3 (vencidas) en el WHERE.
--   Mantiene todos los parametros de roles_setup.sql (@SucursalesJson, @IdSucursal).
-- =============================================================================
ALTER PROCEDURE [COTIZ].[SP_ContarSolicitudes]
    @IdUsuario      VARCHAR(50)   = NULL,
    @SucursalesJson NVARCHAR(MAX) = NULL,
    @IdSucursal     INT           = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*)                                     AS total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS generadas,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS borradores
    FROM [COTIZ].[SOLICITUDES]
    WHERE
        status <> 3   -- excluir vencidas
        AND (
            (@IdSucursal IS NOT NULL AND id_sucursal = @IdSucursal)
            OR (@IdSucursal IS NULL AND @SucursalesJson IS NOT NULL
                AND id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson)))
            OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NOT NULL
                AND id_usuario = @IdUsuario)
            OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NULL)
        );
END
GO


-- =============================================================================
-- SECCION 4: ALTER SP_ObtenerSolicitudes
--   Agrega exclusion de status=3 (vencidas) en TODAS las clausulas WHERE.
--   Mantiene toda la logica de paginacion, filtros y parametros previos.
-- =============================================================================
ALTER PROCEDURE [COTIZ].[SP_ObtenerSolicitudes]
    @IdUsuario      VARCHAR(50)   = NULL,
    @Filtros        NVARCHAR(MAX) = NULL,
    @Pagina         INT           = 1,
    @TamanoPagina   INT           = 20,
    @SucursalesJson NVARCHAR(MAX) = NULL,
    @IdSucursal     INT           = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FiltroSolicitante NVARCHAR(200) = JSON_VALUE(@Filtros, '$.solicitante');
    DECLARE @FiltroVehiculo    NVARCHAR(200) = JSON_VALUE(@Filtros, '$.vehiculo');
    DECLARE @FiltroStatus      INT           = TRY_CAST(JSON_VALUE(@Filtros, '$.status') AS INT);
    DECLARE @FiltroFechaDesde  DATE          = TRY_CAST(JSON_VALUE(@Filtros, '$.fechaDesde') AS DATE);
    DECLARE @FiltroFechaHasta  DATE          = TRY_CAST(JSON_VALUE(@Filtros, '$.fechaHasta') AS DATE);

    DECLARE @HayFiltros BIT = 0;
    IF @FiltroSolicitante IS NOT NULL OR @FiltroVehiculo IS NOT NULL
       OR @FiltroStatus IS NOT NULL OR @FiltroFechaDesde IS NOT NULL
       OR @FiltroFechaHasta IS NOT NULL
        SET @HayFiltros = 1;

    IF @Pagina < 1         SET @Pagina = 1;
    IF @TamanoPagina < 1   SET @TamanoPagina = 20;
    IF @TamanoPagina > 200 SET @TamanoPagina = 200;

    DECLARE @Offset INT = (@Pagina - 1) * @TamanoPagina;

    -- ================================================================
    -- RAMA A: hay filtros de busqueda -> devuelve todos los coincidentes
    -- ================================================================
    IF @HayFiltros = 1
    BEGIN
        SELECT
            s.id, s.status, s.fecha_emision, s.nro_version,
            sol.nombre AS solicitante_nombre, sol.correo AS solicitante_email,
            TRY_CAST(sol.id AS NVARCHAR) + ' ' + ISNULL(sol.nom_intermediario,'') AS intermediario,
            sol.tipo_persona,
            veh.placa  AS vehiculo_placa,
            vis.descmarca  AS vehiculo_marca, vis.descmodelo AS vehiculo_modelo,
            veh.anho   AS vehiculo_anho
        FROM [COTIZ].[SOLICITUDES] s
        LEFT JOIN [COTIZ].[SOLICITUDES_SOLICITANTE] sol ON sol.id = s.id
        LEFT JOIN [COTIZ].[SOLICITUDES_VEHICULO]    veh ON veh.id = s.id
        LEFT JOIN [COTIZ].[VVEH_MARCA_MODELO]       vis
            ON vis.CODMARCA  = veh.marca
           AND vis.codmodelo = veh.modelo
        WHERE
            s.status <> 3   -- excluir vencidas
            AND (
                (@IdSucursal IS NOT NULL AND s.id_sucursal = @IdSucursal)
                OR (@IdSucursal IS NULL AND @SucursalesJson IS NOT NULL
                    AND s.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson)))
                OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NOT NULL
                    AND s.id_usuario = @IdUsuario)
                OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NULL)
            )
            AND (@FiltroSolicitante IS NULL OR sol.nombre LIKE '%'+@FiltroSolicitante+'%' OR sol.correo LIKE '%'+@FiltroSolicitante+'%')
            AND (@FiltroVehiculo    IS NULL OR veh.placa LIKE '%'+@FiltroVehiculo+'%' OR vis.descmarca LIKE '%'+@FiltroVehiculo+'%' OR vis.descmodelo LIKE '%'+@FiltroVehiculo+'%')
            AND (@FiltroStatus      IS NULL OR s.status = @FiltroStatus)
            AND (@FiltroFechaDesde  IS NULL OR CAST(s.fecha_emision AS DATE) >= @FiltroFechaDesde)
            AND (@FiltroFechaHasta  IS NULL OR CAST(s.fecha_emision AS DATE) <= @FiltroFechaHasta)
        ORDER BY s.fecha_emision DESC;

        -- Metadata (result set 2)
        SELECT COUNT(*) AS total_registros, NULL AS pagina_actual, NULL AS tamano_pagina, NULL AS total_paginas, 1 AS tiene_filtros
        FROM [COTIZ].[SOLICITUDES] s
        LEFT JOIN [COTIZ].[SOLICITUDES_SOLICITANTE] sol ON sol.id = s.id
        LEFT JOIN [COTIZ].[SOLICITUDES_VEHICULO]    veh ON veh.id = s.id
        LEFT JOIN [COTIZ].[VVEH_MARCA_MODELO]       vis ON vis.CODMARCA = veh.marca AND vis.codmodelo = veh.modelo
        WHERE
            s.status <> 3   -- excluir vencidas
            AND (
                (@IdSucursal IS NOT NULL AND s.id_sucursal = @IdSucursal)
                OR (@IdSucursal IS NULL AND @SucursalesJson IS NOT NULL
                    AND s.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson)))
                OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NOT NULL
                    AND s.id_usuario = @IdUsuario)
                OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NULL)
            )
            AND (@FiltroSolicitante IS NULL OR sol.nombre LIKE '%'+@FiltroSolicitante+'%' OR sol.correo LIKE '%'+@FiltroSolicitante+'%')
            AND (@FiltroVehiculo    IS NULL OR veh.placa LIKE '%'+@FiltroVehiculo+'%' OR vis.descmarca LIKE '%'+@FiltroVehiculo+'%' OR vis.descmodelo LIKE '%'+@FiltroVehiculo+'%')
            AND (@FiltroStatus      IS NULL OR s.status = @FiltroStatus)
            AND (@FiltroFechaDesde  IS NULL OR CAST(s.fecha_emision AS DATE) >= @FiltroFechaDesde)
            AND (@FiltroFechaHasta  IS NULL OR CAST(s.fecha_emision AS DATE) <= @FiltroFechaHasta);
    END
    -- ================================================================
    -- RAMA B: sin filtros -> paginar con OFFSET/FETCH
    -- ================================================================
    ELSE
    BEGIN
        SELECT
            s.id, s.status, s.fecha_emision, s.nro_version,
            sol.nombre AS solicitante_nombre, sol.correo AS solicitante_email,
            TRY_CAST(sol.id AS NVARCHAR) + ' ' + ISNULL(sol.nom_intermediario,'') AS intermediario,
            sol.tipo_persona,
            veh.placa  AS vehiculo_placa,
            vis.descmarca  AS vehiculo_marca, vis.descmodelo AS vehiculo_modelo,
            veh.anho   AS vehiculo_anho
        FROM [COTIZ].[SOLICITUDES] s
        LEFT JOIN [COTIZ].[SOLICITUDES_SOLICITANTE] sol ON sol.id = s.id
        LEFT JOIN [COTIZ].[SOLICITUDES_VEHICULO]    veh ON veh.id = s.id
        LEFT JOIN [COTIZ].[VVEH_MARCA_MODELO]       vis
            ON vis.CODMARCA  = veh.marca
           AND vis.codmodelo = veh.modelo
        WHERE
            s.status <> 3   -- excluir vencidas
            AND (
                (@IdSucursal IS NOT NULL AND s.id_sucursal = @IdSucursal)
                OR (@IdSucursal IS NULL AND @SucursalesJson IS NOT NULL
                    AND s.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson)))
                OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NOT NULL
                    AND s.id_usuario = @IdUsuario)
                OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NULL)
            )
        ORDER BY s.fecha_emision DESC
        OFFSET @Offset ROWS FETCH NEXT @TamanoPagina ROWS ONLY;

        -- Metadata (result set 2)
        SELECT
            cnt.total                                          AS total_registros,
            @Pagina                                            AS pagina_actual,
            @TamanoPagina                                      AS tamano_pagina,
            CEILING(CAST(cnt.total AS FLOAT) / @TamanoPagina)  AS total_paginas,
            0                                                  AS tiene_filtros
        FROM (
            SELECT COUNT(*) AS total
            FROM [COTIZ].[SOLICITUDES] s
            WHERE
                s.status <> 3   -- excluir vencidas
                AND (
                    (@IdSucursal IS NOT NULL AND s.id_sucursal = @IdSucursal)
                    OR (@IdSucursal IS NULL AND @SucursalesJson IS NOT NULL
                        AND s.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson)))
                    OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NOT NULL
                        AND s.id_usuario = @IdUsuario)
                    OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NULL)
                )
        ) cnt;
    END
END
GO
