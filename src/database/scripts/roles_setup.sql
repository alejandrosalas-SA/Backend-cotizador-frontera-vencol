USE [INTEGRACION_ACSEL]
GO

-- =============================================================================
--  roles_setup.sql
--  Ejecutar en SSMS contra la base de datos INTEGRACION_ACSEL.
--  Contiene:
--    1) Datos de COTIZ.ROLES_USUARIOS
--    2) Fix de sp_GetSucursalesUsuario (faltaba filtro por @cod_emp)
--    3) ALTER de SP_ContarSolicitudes (agrega @SucursalesJson + @IdSucursal)
--    4) ALTER de SP_ObtenerSolicitudes (agrega @SucursalesJson + @IdSucursal)
--    5) Nuevo SP sp_GetDashboardEstadisticasSucursal (filtrado por sucursales)
-- =============================================================================


-- =============================================================================
-- SECCION 1: Llenar COTIZ.ROLES_USUARIOS
--   La tabla tiene: id INT IDENTITY, nombre VARCHAR(MAX), status INT
-- =============================================================================
SET IDENTITY_INSERT [COTIZ].[ROLES_USUARIOS] ON;
GO

MERGE [COTIZ].[ROLES_USUARIOS] AS target
USING (VALUES
  (1, 'Administrador', 1),
  (2, 'Supervisor',    1),
  (3, 'Empleado',      1)
) AS src (id, nombre, status)
ON target.id = src.id
WHEN MATCHED     THEN UPDATE SET nombre = src.nombre, status = src.status
WHEN NOT MATCHED THEN INSERT (id, nombre, status) VALUES (src.id, src.nombre, src.status);

SET IDENTITY_INSERT [COTIZ].[ROLES_USUARIOS] OFF;
GO


-- =============================================================================
-- SECCION 2: Fix de sp_GetSucursalesUsuario
--   BUG ORIGINAL: El WHERE no filtraba por @cod_emp, devolviendo todas las
--   sucursales activas a cualquier usuario.
--   CORRECCION: Agregar US.cod_emp = @cod_emp en el WHERE.
-- =============================================================================
ALTER PROCEDURE [COTIZ].[sp_GetSucursalesUsuario]
    @cod_emp CHAR(17)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT US.id_sucursal AS id, S.nombre
    FROM [COTIZ].[USUARIOS_SUCURSAL] US
    JOIN [COTIZ].[SUCURSALES] S ON US.id_sucursal = S.id
    WHERE US.cod_emp = @cod_emp
      AND S.status = 1;
END
GO


-- =============================================================================
-- SECCION 3: ALTER SP_ContarSolicitudes
--   Agrega @SucursalesJson y @IdSucursal.
--
--   LOGICA de filtrado (en orden de prioridad):
--     1. @IdSucursal IS NOT NULL      -> filtra esa sucursal exacta
--     2. @SucursalesJson IS NOT NULL  -> filtra por array de sucursales
--     3. @IdUsuario IS NOT NULL       -> filtra por usuario (empleado)
--     4. Todo NULL                   -> sin restriccion (admin global)
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
        (@IdSucursal IS NOT NULL AND id_sucursal = @IdSucursal)
        OR (@IdSucursal IS NULL AND @SucursalesJson IS NOT NULL
            AND id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson)))
        OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NOT NULL
            AND id_usuario = @IdUsuario)
        OR (@IdSucursal IS NULL AND @SucursalesJson IS NULL AND @IdUsuario IS NULL);
END
GO


-- =============================================================================
-- SECCION 4: ALTER SP_ObtenerSolicitudes
--   Agrega @SucursalesJson y @IdSucursal manteniendo la logica original de
--   paginacion, filtros de busqueda y los dos result sets (datos + metadata).
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
            (
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
            (
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
            (
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
                (
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


-- =============================================================================
-- SECCION 5: Nuevo SP sp_GetDashboardEstadisticasSucursal
--   Igual a sp_GetDashboardEstadisticas pero con @SucursalesJson opcional.
--   NULL = estadisticas globales (admin sin filtro).
--   '[1,3]' = solo esas sucursales (supervisor o admin filtrando por sucursal).
-- =============================================================================
CREATE OR ALTER PROCEDURE [COTIZ].[sp_GetDashboardEstadisticasSucursal]
    @SucursalesJson NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- ---------------------------------------------------------------
    -- RESULT SET 1: KPIs
    -- ---------------------------------------------------------------
    DECLARE @hoy         DATE = CAST(GETDATE() AS DATE);
    DECLARE @ini_mes_act DATE = DATEFROMPARTS(YEAR(@hoy), MONTH(@hoy), 1);
    DECLARE @ini_mes_ant DATE = DATEADD(MONTH, -1, @ini_mes_act);
    DECLARE @fin_mes_ant DATE = DATEADD(DAY, -1, @ini_mes_act);

    WITH primas_por_solicitud AS (
        SELECT
            s.id, s.status, s.fecha_emision, s.id_sucursal, s.id_usuario,
            ISNULL(SUM(sc.prima), 0) AS prima_total
        FROM [COTIZ].[SOLICITUDES] s
        LEFT JOIN [COTIZ].[SOLICITUDES_COBERTURAS] sc ON sc.id_solicitud = s.id
        WHERE (
            @SucursalesJson IS NULL
            OR s.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson))
        )
        GROUP BY s.id, s.status, s.fecha_emision, s.id_sucursal, s.id_usuario
    ),
    kpi_mes_actual AS (
        SELECT
            ISNULL(SUM(prima_total), 0) AS ingresos_mes_actual,
            COUNT(*)                     AS total_emitidas_mes
        FROM primas_por_solicitud
        WHERE status = 1
          AND fecha_emision >= @ini_mes_act
          AND fecha_emision <  DATEADD(MONTH, 1, @ini_mes_act)
    ),
    kpi_mes_anterior AS (
        SELECT ISNULL(SUM(prima_total), 0) AS ingresos_mes_anterior
        FROM primas_por_solicitud
        WHERE status = 1
          AND fecha_emision >= @ini_mes_ant
          AND fecha_emision <= @fin_mes_ant
    ),
    kpi_borradores AS (
        SELECT COUNT(*) AS total_borradores
        FROM [COTIZ].[SOLICITUDES] s
        WHERE s.status = 0
          AND (
            @SucursalesJson IS NULL
            OR s.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson))
          )
    )
    SELECT
        kma.ingresos_mes_actual,
        kman.ingresos_mes_anterior,
        CAST(
            CASE
                WHEN kman.ingresos_mes_anterior = 0 THEN 0
                ELSE (kma.ingresos_mes_actual - kman.ingresos_mes_anterior)
                     * 100.0 / kman.ingresos_mes_anterior
            END
        AS DECIMAL(10,2))                                              AS porcentaje_crecimiento,
        kb.total_borradores,
        kma.total_emitidas_mes                                         AS total_emitidas,
        CAST(
            kma.total_emitidas_mes * 100.0
            / NULLIF(kma.total_emitidas_mes + kb.total_borradores, 0)
        AS DECIMAL(10,2))                                              AS tasa_conversion,
        CAST(
            kma.ingresos_mes_actual * 1.0
            / NULLIF(kma.total_emitidas_mes, 0)
        AS DECIMAL(18,3))                                              AS ticket_promedio
    FROM kpi_mes_actual  kma
    CROSS JOIN kpi_mes_anterior kman
    CROSS JOIN kpi_borradores   kb;

    -- ---------------------------------------------------------------
    -- RESULT SET 2: Top 10 vehiculos
    -- ---------------------------------------------------------------
    SELECT TOP 10
        vm.descmarca + ' ' + vm.descmodelo AS marca_modelo,
        COUNT(sv.id)                       AS cantidad_cotizaciones
    FROM [COTIZ].[SOLICITUDES_VEHICULO] sv
    JOIN [COTIZ].[VVEH_MARCA_MODELO] vm
        ON  TRY_CONVERT(smallint, sv.marca)  = vm.CODMARCA
        AND TRY_CONVERT(smallint, sv.modelo) = vm.codmodelo
    JOIN [COTIZ].[SOLICITUDES] s ON s.id = sv.id_solicitud
    WHERE (
        @SucursalesJson IS NULL
        OR s.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson))
    )
    GROUP BY vm.descmarca, vm.descmodelo
    ORDER BY cantidad_cotizaciones DESC;

    -- ---------------------------------------------------------------
    -- RESULT SET 3: Distribucion por tipo de transporte
    -- ---------------------------------------------------------------
    DECLARE @total_solicitudes INT = (
        SELECT COUNT(*) FROM [COTIZ].[SOLICITUDES] s
        WHERE (
            @SucursalesJson IS NULL
            OR s.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson))
        )
    );

    SELECT
        tv.nombre                                                 AS tipo_transporte_nombre,
        COUNT(sv.id)                                              AS cantidad,
        CAST(COUNT(sv.id) * 100.0 / NULLIF(@total_solicitudes, 0)
        AS DECIMAL(5,2))                                          AS porcentaje
    FROM [COTIZ].[SOLICITUDES_VEHICULO] sv
    JOIN [COTIZ].[TIPO_VEHICULOS] tv ON tv.id = sv.tipo_vehiculo
    JOIN [COTIZ].[SOLICITUDES] s ON s.id = sv.id_solicitud
    WHERE (
        @SucursalesJson IS NULL
        OR s.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson))
    )
    GROUP BY tv.nombre
    ORDER BY cantidad DESC;

    -- ---------------------------------------------------------------
    -- RESULT SET 4: Rendimiento por sucursal
    -- ---------------------------------------------------------------
    SELECT
        suc.nombre                                                AS sucursal,
        SUM(CASE WHEN sol.status = 0 THEN 1 ELSE 0 END)          AS borradores,
        SUM(CASE WHEN sol.status = 1 THEN 1 ELSE 0 END)          AS solicitudes_generadas
    FROM [COTIZ].[SOLICITUDES] sol
    JOIN [COTIZ].[SUCURSALES] suc ON suc.id = sol.id_sucursal
    WHERE (
        @SucursalesJson IS NULL
        OR sol.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson))
    )
    GROUP BY suc.nombre
    ORDER BY solicitudes_generadas DESC;

    -- ---------------------------------------------------------------
    -- RESULT SET 5: Rendimiento por empleado
    -- ---------------------------------------------------------------
    SELECT
        u.nombre + ' ' + u.apellido                              AS nombre_completo,
        SUM(CASE WHEN sol.status = 1 THEN 1 ELSE 0 END)          AS total_generadas,
        SUM(CASE WHEN sol.status = 0 THEN 1 ELSE 0 END)          AS total_borradores,
        COUNT(sol.id)                                            AS total_procesadas,
        CAST(
            SUM(CASE WHEN sol.status = 1 THEN 1 ELSE 0 END) * 100.0
            / NULLIF(COUNT(sol.id), 0)
        AS DECIMAL(10,2))                                        AS tasa_cierre
    FROM [COTIZ].[SOLICITUDES] sol
    JOIN [COTIZ].[USUARIOS] u ON u.cod_emp = sol.id_usuario
    WHERE (
        @SucursalesJson IS NULL
        OR sol.id_sucursal IN (SELECT CAST([value] AS INT) FROM OPENJSON(@SucursalesJson))
    )
    GROUP BY u.nombre, u.apellido
    ORDER BY total_generadas DESC;

END;
GO
