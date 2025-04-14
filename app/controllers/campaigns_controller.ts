import Campaign from '#models/campaign'
import type { HttpContext } from '@adonisjs/core/http'

export default class CampaignsController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    const campaigns = await Campaign.query().preload('pedidos')
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
      })
      .first()
    console.log(campaign)
    return campaign
  }

  // Crear un nuevo campaign (POST /plans)
  public async store({ request }: HttpContext) {
    const data = request.only(['name']) // Asume que estos campos existen
    const campaign = await Campaign.create(data)
    return campaign
  }

  // Actualizar un plan existente (PUT /plans/:id)
  public async update({ params, request }: HttpContext) {
    const campaign = await Campaign.findOrFail(params.id)
    const data = request.only(['name']) // Asume que estos campos existen
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
