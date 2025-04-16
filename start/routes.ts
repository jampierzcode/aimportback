/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import RolesController from '#controllers/roles_controller'
import SedesController from '#controllers/sedes_controller'
import PedidosController from '#controllers/pedidos_controller'
import CampaignsController from '#controllers/campaigns_controller'
import UsersController from '#controllers/users_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.post('/api/register', [AuthController, 'register']).as('auth.register')
router.post('/api/newuser', [AuthController, 'createUser']).as('auth.createUser')
router.post('/api/login', [AuthController, 'login']).as('auth.login')
router.delete('/api/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())
router.get('/api/me', [AuthController, 'me']).as('auth.me')

// RUTAS PARA roles
router.get('/api/roles', [RolesController, 'index']).as('role.index')
router.get('/api/roles/:id', [RolesController, 'show']).as('role.show')
router.post('/api/roles', [RolesController, 'store']).as('role.store')
router.put('/api/roles/:id', [RolesController, 'update']).as('role.update')
router.delete('/api/roles/:id', [RolesController, 'destroy']).as('role.destroy')

// RUTAS PARA roles
router.get('/api/users', [UsersController, 'index']).as('user.index')
router.get('/api/users/:id', [UsersController, 'show']).as('user.show')
router.post('/api/users', [UsersController, 'store']).as('user.store')
router.put('/api/users/:id', [UsersController, 'update']).as('user.update')
router.delete('/api/users/:id', [UsersController, 'destroy']).as('user.destroy')
router.get('/api/usersSuperadmin', [UsersController, 'usersSuperadmin']).as('user.usersSuperadmin')

// RUTAS PARA sedes
router.get('/api/sedes', [SedesController, 'index']).as('sede.index')
router.get('/api/sedes/:id', [SedesController, 'show']).as('sede.show')
router.post('/api/sedes', [SedesController, 'store']).as('sede.store')
router.put('/api/sedes/:id', [SedesController, 'update']).as('sede.update')
router.delete('/api/sedes/:id', [SedesController, 'destroy']).as('sede.destroy')

// RUTAS PARA pedidos
router.get('/api/pedidos', [PedidosController, 'index']).as('pedido.index')
router.get('/api/pedidos/:id', [PedidosController, 'show']).as('pedido.show')
router
  .get('/api/pedidoByTracking/:id_solicitante', [PedidosController, 'pedidoByTracking'])
  .as('pedido.pedidoByTracking')
router.post('/api/pedidos', [PedidosController, 'store']).as('pedido.store')
router.put('/api/pedidos/:id', [PedidosController, 'update']).as('pedido.update')
router.delete('/api/pedidos/:id', [PedidosController, 'destroy']).as('pedido.destroy')
router.post('/api/pedidosMasive', [PedidosController, 'pedidosMasive']).as('pedido.pedidosMasive')
router
  .post('/api/pedidosMasiveByCampaign', [PedidosController, 'pedidosMasiveByCampaign'])
  .as('pedido.pedidosMasiveByCampaign')
router
  .post('/api/senDataPedidosCargadaMasive', [PedidosController, 'senDataPedidosCargadaMasive'])
  .as('pedido.senDataPedidosCargadaMasive')

// RUTAS PARA campaign
router.get('/api/campaigns', [CampaignsController, 'index']).as('campaign.index')
router.get('/api/campaigns/:id', [CampaignsController, 'show']).as('campaign.show')
router.post('/api/campaigns', [CampaignsController, 'store']).as('campaign.store')
router.put('/api/campaigns/:id', [CampaignsController, 'update']).as('campaign.update')
router.delete('/api/campaigns/:id', [CampaignsController, 'destroy']).as('campaign.destroy')
