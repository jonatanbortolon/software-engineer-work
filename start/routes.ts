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

Route.group(() => {
  Route.get('/', async ({ view }) => {
    return view.render('index')
  }).as('home')

  Route.group(() => {
    Route.get('/dashboard', 'DashboardController.index').as('dashboard')

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

    Route.get('/signout', 'AuthController.signoutGet').as('auth.signout')
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
    })
      .prefix('/cadastrar')
      .as('signup')
  })
    .as('auth')
    .middleware('notAuth')
}).middleware('silentAuth')
