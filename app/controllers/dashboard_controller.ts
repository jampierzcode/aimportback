import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class DashboardController {
  // GET /api/dashboard/stats
  // Números clave para el dashboard del superadmin: pedidos, usuarios,
  // pedidos faltantes de la semana y el desglose de pedidos por estado.
  public async stats({}: HttpContext) {
    // Lunes 00:00 de la semana actual (ISO: weekday 1 = lunes)
    const weekStart = DateTime.now().set({ weekday: 1 }).startOf('day')
    const weekStartJS = weekStart.toJSDate()

    const [{ total: totalUsuarios }, { total: totalSedes }, { total: totalCampanas }, pedidos] =
      await Promise.all([
        db.from('users').count('* as total').first(),
        db.from('sedes').count('* as total').first(),
        db.from('campaigns').count('* as total').first(),
        // Un registro por pedido con su último status (el más reciente en pedidos_status)
        db
          .from('pedidos as p')
          .select('p.id', 'p.created_at', 'p.campaign_id')
          .select(
            db.raw(
              `(
                select ps.status from pedidos_status ps
                where ps.pedido_id = p.id
                order by ps.created_at desc, ps.id desc
                limit 1
              ) as last_status`
            )
          ),
      ])

    let pedidosEntregados = 0
    let pedidosFaltantes = 0
    let pedidosEstaSemana = 0
    let pedidosEntregadosEstaSemana = 0
    let pedidosFaltantesEstaSemana = 0
    const porEstadoMap = new Map<string, number>()
    const campanasConFaltantes = new Set<number>()

    for (const row of pedidos as any[]) {
      const lastStatus: string | null = row.last_status || null
      const isEntregado = lastStatus === 'entregado'

      if (isEntregado) {
        pedidosEntregados++
      } else {
        pedidosFaltantes++
        if (row.campaign_id) campanasConFaltantes.add(row.campaign_id)
      }

      const key = lastStatus || 'sin_estado'
      porEstadoMap.set(key, (porEstadoMap.get(key) ?? 0) + 1)

      const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at)
      if (createdAt >= weekStartJS) {
        pedidosEstaSemana++
        if (isEntregado) pedidosEntregadosEstaSemana++
        else pedidosFaltantesEstaSemana++
      }
    }

    const pedidosPorEstado = Array.from(porEstadoMap.entries())
      .map(([status, total]) => ({ status, total }))
      .sort((a, b) => b.total - a.total)

    return {
      status: 'success',
      data: {
        totalUsuarios: Number(totalUsuarios ?? 0),
        totalSedes: Number(totalSedes ?? 0),
        totalCampanas: Number(totalCampanas ?? 0),
        campanasActivas: campanasConFaltantes.size,
        totalPedidos: pedidos.length,
        pedidosEntregados,
        pedidosFaltantes,
        pedidosEstaSemana,
        pedidosEntregadosEstaSemana,
        pedidosFaltantesEstaSemana,
        pedidosPorEstado,
        semanaInicio: weekStart.toISODate(),
      },
    }
  }
}
