import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Product from 'App/Models/Product'
import Sale from 'App/Models/Sale'

export default class DashboardController {
  public async index({ view }: HttpContextContract) {
    const productsChart = (
      await Product.query()
        .join('product_sale', 'product_sale.product_id', '=', 'products.id')
        .groupBy('products.id')
        .sum('quantity')
        .select('name')
        .orderBy('quantity', 'desc')
        .limit(6)
    ).map((product) => {
      return { name: product.$attributes.name, quantity: product.$extras['sum(`quantity`)'] }
    })

    const billingsChart = (
      await Sale.query()
        .join('product_sale', 'product_sale.sale_id', '=', 'sales.id')
        .join('products', 'products.id', '=', 'product_sale.product_id')
        .groupByRaw('DATE(sales.created_at)')
        .sum('price', 'totalPrice')
        .select(Database.raw('DATE(sales.created_at) as period'))
        .orderBy(Database.raw('DATE(sales.created_at)'), 'asc')
        .limit(6)
    ).map((product) => {
      return { ...product.$extras }
    })

    const clientsChart = (
      await Sale.query()
        .join('product_sale', 'product_sale.sale_id', '=', 'sales.id')
        .join('products', 'products.id', '=', 'product_sale.product_id')
        .join('clients', 'clients.id', '=', 'sales.client_id')
        .sum('price', 'totalPrice')
        .select('clients.name', 'clients.phone', 'clients.email')
        .groupBy('sales.client_id')
        .orderBy('totalPrice', 'desc')
        .limit(6)
    ).map((product) => {
      return { ...product.$extras }
    })

    return view.render('dashboard', {
      productsChart: productsChart,
      billingsChart: billingsChart,
      clientsChart: clientsChart,
    })
  }
}
