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

Route.get('/', async ({ view }) => {
  return view.render('welcome')
}).as('home')

Route.group(() => {
  Route.get('/dashboard', 'DashboardController.index').as('dashboard')

  Route.get('/clientes', 'ClientsController.index').as('clients.get')
  Route.post('/clientes', 'ClientsController.store').as('clients.store')
  Route.post('/clientes/:id', 'ClientsController.update').as('clients.update')
  Route.post('/clientes/delete/:id', 'ClientsController.delete').as('clients.delete')

  Route.get('/produtos', 'ProductsController.index').as('products.get')
  Route.post('/produtos', 'ProductsController.store').as('products.store')
  Route.post('/produtos/:id', 'ProductsController.update').as('products.update')
  Route.post('/produtos/delete/:id', 'ProductsController.delete').as('products.delete')

  Route.get('/vendas', 'SalesController.index').as('sales.get')
  Route.post('/vendas', 'SalesController.store').as('sales.store')
  Route.post('/vendas/:id', 'SalesController.update').as('sales.update')
  Route.post('/vendas/delete/:id', 'SalesController.delete').as('sales.delete')

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
