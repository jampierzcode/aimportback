import Lesson from '#models/lesson'
import type { HttpContext } from '@adonisjs/core/http'

export default class LessonsController {
  public async index({}: HttpContext) {
    const lessons = await Lesson.all()
    return lessons
  }

  // Mostrar un plan individual por ID (GET /plans/:id)
  public async show({ params }: HttpContext) {
    console.log(params)
    const lesson = await Lesson.findOrFail(params.id)
    console.log(lesson)
    return lesson
  }
  //   public async lessonsBySectionId({ params }: HttpContext) {
  //     console.log(params)
  //     const lessons = await Lesson.query().where('course_id', params.id)
  //     console.log(lessons)
  //     return lessons
  //   }

  // Crear un nuevo lesson (POST /plans)
  public async store({ request }: HttpContext) {
    const data = request.only([
      'section_id',
      'title',
      'description',
      'position',
      'resource',
      'type_lesson',
      'duration',
    ]) // Asume que estos campos existen
    const lesson = await Lesson.create(data)
    return lesson
  }

  // Actualizar un plan existente (PUT /plans/:id)
  public async update({ params, request }: HttpContext) {
    const lesson = await Lesson.findOrFail(params.id)
    const data = request.only([
      'section_id',
      'title',
      'description',
      'position',
      'resource',
      'type_lesson',
      'duration',
    ])
    lesson.merge(data)
    await lesson.save()
    return lesson
  }

  // Eliminar un lesson (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    const lesson = await Lesson.findOrFail(params.id)
    await lesson.delete()
    return { message: 'lesson deleted successfully' }
  }
}
