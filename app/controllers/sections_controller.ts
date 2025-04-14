import Section from '#models/section'
import type { HttpContext } from '@adonisjs/core/http'

export default class SectionsController {
  public async index({}: HttpContext) {
    const sections = await Section.all()
    return sections
  }

  // Mostrar un plan individual por ID (GET /plans/:id)
  public async show({ params }: HttpContext) {
    console.log(params)
    const section = await Section.findOrFail(params.id)
    console.log(section)
    return section
  }
  public async sectionsByCourseId({ params }: HttpContext) {
    console.log(params)
    const sections = await Section.query().where('course_id', params.id)
    console.log(sections)
    return sections
  }

  // Crear un nuevo section (POST /plans)
  public async store({ request }: HttpContext) {
    const data = request.only(['title', 'course_id', 'position']) // Asume que estos campos existen
    const section = await Section.create(data)
    return section
  }

  // Actualizar un plan existente (PUT /plans/:id)
  public async update({ params, request }: HttpContext) {
    const section = await Section.findOrFail(params.id)
    const data = request.only(['title', 'course_id', 'position'])
    section.merge(data)
    await section.save()
    return section
  }

  // Eliminar un section (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    const section = await Section.findOrFail(params.id)
    await section.delete()
    return { message: 'section deleted successfully' }
  }
}
