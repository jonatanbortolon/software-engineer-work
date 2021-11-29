/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy ? response.ok(report) : response.badRequest(report)
})

Route.group(() => {
  Route.get('/', async ({ view }) => {
    return view.render('index')
  }).as('home')

  Route.group(() => {
    Route.get('/dashboard', 'DashboardController.index').as('dashboard.get')

    Route.group(() => {
      Route.get('/', 'ProfileController.index').as('get')
      Route.post('/', 'ProfileController.update').as('update')
    })
      .prefix('meu-perfil')
      .as('myprofile')

    Route.group(() => {
      Route.get('/', 'ClientsController.index').as('get')
      Route.post('/', 'ClientsController.store').as('store')
      Route.post('/:id', 'ClientsController.update').as('update')
      Route.post('/delete/:id', 'ClientsController.delete').as('delete')
    })
      .prefix('clientes')
      .as('clients')

    Route.group(() => {
      Route.get('/', 'ProductsController.index').as('get')
      Route.post('/', 'ProductsController.store').as('store')
      Route.post('/:id', 'ProductsController.update').as('update')
      Route.post('/delete/:id', 'ProductsController.delete').as('delete')
    })
      .prefix('produtos')
      .as('products')

    Route.group(() => {
      Route.get('/', 'SalesController.index').as('get')
      Route.post('/', 'SalesController.store').as('store')
      Route.post('/:id', 'SalesController.update').as('update')
      Route.post('/delete/:id', 'SalesController.delete').as('delete')
    })
      .prefix('vendas')
      .as('sales')

    Route.group(() => {
      Route.post('/', 'StocksController.store').as('store')
    })
      .prefix('estoques')
      .as('stocks')

    Route.group(() => {
      Route.post('/', 'SignupLinksController.store').as('store')
    })
      .prefix('link-registro')
      .as('signuplinks')

    Route.group(() => {
      Route.get('/', 'AccountsController.index').as('get')
      Route.post('/', 'AccountsController.update').as('update')
    })
      .prefix('contas')
      .as('accounts')

    Route.group(() => {
      Route.get('/signout', 'AuthController.signoutGet').as('signout.get')
      Route.post('/:id', 'AuthController.deleteParentPost').as('delete')
    })
      .prefix('user')
      .as('auth')
  }).middleware(['userInfo', 'auth'])

  Route.group(() => {
    Route.group(() => {
      Route.get('/', 'AuthController.signinGet').as('get')
      Route.post('/', 'AuthController.signinPost').as('post')
    })
      .prefix('/entrar')
      .as('signin')

    Route.group(() => {
      Route.get('/', 'AuthController.signupGet').as('get')
      Route.post('/', 'AuthController.signupPost').as('post')

      Route.group(() => {
        Route.get('/', 'AuthController.signupParentGet').as('get')
        Route.post('/', 'AuthController.signupParentPost').as('post')
      })
        .prefix('/:slug')
        .as('parent')
    })
      .prefix('/cadastrar')
      .as('signup')
  })
    .as('auth')
    .middleware('notAuth')
}).middleware('silentAuth')
