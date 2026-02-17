import Campaign from '#models/campaign'
import PedidoAsignado from '#models/pedido_asignado'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class CampaignsController {
  // Listar campañas (GET /campaigns)
  // Filtros:
  //  - cliente_id (proveedor)
  //  - from, to (YYYY-MM-DD) sobre created_at
  //  - pedido_status:
  //      * "finalizada" => todos los pedidos entregados (y tiene pedidos)
  //      * "faltan"/"pendiente" => existe al menos 1 pedido no entregado
  //      * cualquier otro => existe al menos 1 pedido con status_pedido.name = X
  public async index({ request }: HttpContext) {
    const { cliente_id, clienteId, from, to, pedido_status } = request.qs()

    const q = Campaign.query()
      .preload('cliente')
      // ✅ Counts SIEMPRE
      .withCount('pedidos', (pq) => pq.as('totalPedidos'))
      .withCount('pedidos', (pq) =>
        pq.whereHas('status_pedido', (sq) => sq.where('name', 'entregado')).as('entregadosCount')
      )
      .withCount('pedidos', (pq) =>
        pq.whereHas('status_pedido', (sq) => sq.whereNot('name', 'entregado')).as('faltantesCount')
      )
    console.log(q)
    // ✅ filtro proveedor (acepta cliente_id o clienteId por si tu front manda camelCase)
    const cid = cliente_id ?? clienteId
    if (cid) q.where('cliente_id', Number(cid))

    // ✅ filtro rango fechas (created_at)
    if (from || to) {
      const start = from
        ? DateTime.fromISO(String(from)).startOf('day')
        : DateTime.fromISO('1970-01-01').startOf('day')

      const end = to ? DateTime.fromISO(String(to)).endOf('day') : DateTime.now().endOf('day')

      q.whereBetween('created_at', [start.toJSDate(), end.toJSDate()])
    }

    // ✅ filtro por estado de pedidos
    if (pedido_status) {
      const ps = String(pedido_status).trim().toLowerCase()

      if (ps === 'finalizada' || ps === 'finalizadas') {
        // tiene pedidos y todos entregados
        q.has('pedidos')
        q.whereDoesntHave('pedidos', (pq) => {
          pq.whereHas('status_pedido', (sq) => {
            sq.whereNot('name', 'entregado')
          })
        })
      } else if (ps === 'faltan' || ps === 'pendiente' || ps === 'pendientes') {
        // existe al menos 1 NO entregado
        q.whereHas('pedidos', (pq) => {
          pq.whereHas('status_pedido', (sq) => {
            sq.whereNot('name', 'entregado')
          })
        })
      } else {
        // status específico por name
        q.whereHas('pedidos', (pq) => {
          pq.whereHas('status_pedido', (sq) => {
            sq.where('name', String(pedido_status))
          })
        })
      }
    }

    q.orderBy('created_at', 'desc')

    // ✅ IMPORTANTE: ejecutar el query
    const rows = await q

    // debug opcional (puedes borrar):
    // console.log(rows[0]?.toJSON?.())

    return rows
  }

  // Mostrar una campaña (GET /campaigns/:id)
  public async show({ params }: HttpContext) {
    console.log(params)
    const campaign = await Campaign.query()
      .where('id', params.id)
      .preload('pedidos', (pedidoQuery) => {
        pedidoQuery
          .preload('origen')
          .preload('destino')
          .preload('status_pedido')
          .preload('multimedia')
          .preload('asignacion', (asignacionQuery) => {
            asignacionQuery.preload('repartidor')
          })
      })
      .first()

    return campaign
  }

  // Mostrar pedidos asignados a un repartidor de una campaña especifica
  public async campaignAsignadaById({ auth, params }: HttpContext) {
    await auth.check()
    console.log(params)

    const campaign = await Campaign.query()
      .where('id', params.id)
      .preload('pedidos', (pedidoQuery) => {
        pedidoQuery
          .whereExists((subquery) => {
            subquery
              .from('pedidos_asignados')
              .whereRaw('pedidos_asignados.pedido_id = pedidos.id')
              .where('repartidor_id', auth.user!.id)
          })
          .preload('origen')
          .preload('destino')
          .preload('status_pedido')
          .preload('multimedia')
      })
      .firstOrFail()

    return campaign
  }

  // Mostrar campañas asignadas a un usuario repartidor
  public async campaignsAsignadas({ auth }: HttpContext) {
    await auth.check()
    const asignaciones = await PedidoAsignado.query()
      .where('repartidor_id', auth.user!.id)
      .preload('pedido', (pedidoQuery) => {
        pedidoQuery.preload('campaign')
      })

    const campañasUnicas = [
      ...new Map(
        asignaciones
          .map((a) => a.pedido.campaign)
          .filter((c) => c)
          .map((camp) => [camp.id, camp])
      ).values(),
    ]

    return campañasUnicas
  }

  // Crear campaña (POST /campaigns)
  public async store({ request }: HttpContext) {
    const data = request.only(['name', 'cliente_id'])
    const campaign = await Campaign.create(data)
    return campaign
  }

  // Actualizar campaña (PUT /campaigns/:id)
  public async update({ params, request }: HttpContext) {
    const campaign = await Campaign.findOrFail(params.id)
    const data = request.only(['name', 'cliente_id'])
    campaign.merge(data)
    await campaign.save()
    return campaign
  }

  // Eliminar campaña (DELETE /campaigns/:id)
  public async destroy({ params }: HttpContext) {
    const campaign = await Campaign.findOrFail(params.id)
    await campaign.delete()
    return { message: 'campaign deleted successfully' }
  }
}
