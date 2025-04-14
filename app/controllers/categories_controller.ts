import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'

export default class CategoriesController {
  // Listar todos los planes (GET /plans)
  public async index({}: HttpContext) {
    try {
      const categories = await Category.all()
      return {
        status: 'success',
        message: 'Categories fetched with success',
        data: categories,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Categories fetched with error',
        error: error,
      }
    }
  }

  // Mostrar un plan individual por ID (GET /plans/:id)
  public async show({ params }: HttpContext) {
    try {
      console.log(params)
      const category = await Category.findOrFail(params.id)
      console.log(category)

      return {
        status: 'success',
        message: 'Categories fetched with success',
        data: category,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Categories fetched with error',
        error: error,
      }
    }
  }

  // Crear un nuevo category (POST /plans)
  public async store({ request }: HttpContext) {
    try {
      const data = request.only(['name', 'description']) // Asume que estos campos existen
      console.log(data)
      const category = await Category.create(data)
      return {
        status: 'success',
        message: 'Category saved with success',
        data: category,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Error saved category',
        error: error,
      }
    }
  }

  // Actualizar un plan existente (PUT /plans/:id)
  public async update({ params, request }: HttpContext) {
    try {
      const category = await Category.findOrFail(params.id)
      const data = request.only([`name`, 'description'])
      category.merge(data)
      await category.save()
      return {
        status: 'success',
        message: 'Categories fetched with success',
        data: category,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Categories fetched with error',
        error: error,
      }
    }
  }

  // Eliminar un category (DELETE /plans/:id)
  public async destroy({ params }: HttpContext) {
    try {
      const category = await Category.findOrFail(params.id)
      await category.delete()
      return {
        status: 'success',
        message: 'category deleted successfully',
        data: category,
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Categories fetched with error',
        error: error,
      }
    }
  }
}
