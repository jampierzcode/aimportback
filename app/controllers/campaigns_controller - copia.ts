import Campaign from '#models/campaign'
import PedidoAsignado from '#models/pedido_asignado'
import type { HttpContext } from '@adonisjs/core/http'

export default class CampaignsController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    const campaigns = await Campaign.query()

    return campaigns
  }

  // Mostrar un plan individual por ID (GET /plans/:id)
  public async show({ params }: HttpContext) {
    console.log(params)
    const campaign = await Campaign.query()
      .where('id', params.id)
      .preload('pedidos', (pedidoQuery) => {
        pedidoQuery
          .preload('origen') // sede origen
          .preload('destino') // sede destino
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
        // Traer solo los pedidos que estén asignados al user
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
  // Mostrar campñas asignadas a un usuario repartidor
  public async campaignsAsignadas({ auth }: HttpContext) {
    await auth.check()
    const asignaciones = await PedidoAsignado.query()
      .where('repartidor_id', auth.user!.id)
      .preload('pedido', (pedidoQuery) => {
        pedidoQuery.preload('campaign')
      })

    // Extraer campañas, evitando duplicados
    const campañasUnicas = [
      ...new Map(
        asignaciones
          .map((a) => a.pedido.campaign)
          .filter((c) => c) // evitar nulls
          .map((camp) => [camp.id, camp]) // usar Map para evitar duplicados
      ).values(),
    ]

    return campañasUnicas
  }

  // Crear un nuevo campaign (POST /plans)
  public async store({ request }: HttpContext) {
    const data = request.only(['name', 'cliente_id']) // Asume que estos campos existen
    const campaign = await Campaign.create(data)
    return campaign
  }

  // Actualizar un plan existente (PUT /plans/:id)
  public async update({ params, request }: HttpContext) {
    const campaign = await Campaign.findOrFail(params.id)
    const data = request.only(['name', 'cliente_id']) // Asume que estos campos existen
    campaign.merge(data)
    await campaign.save()
    return campaign
  }

  // Eliminar un campaign (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    const campaign = await Campaign.findOrFail(params.id)
    await campaign.delete()
    return { message: 'campaign deleted successfully' }
  }
}
