import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import Product from 'App/Models/Product'
import Sale from 'App/Models/Sale'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class DashboardController {
  public async index({ response, view, auth, session }: HttpContextContract) {
    if (auth.user!.role !== 'ADMIN') {
      session.flash('error', 'Você não tem permissão!')
      return response.redirect().back()
    }

    const productsChart = Object.entries(
      (
        await Sale.query()
          .withScopes((scope) => scope.accountScope(auth.user!.accountId))
          .preload('products')
      ).reduce((carry, sale) => {
        for (const product of Object.keys(sale.$extras.totalProducts)) {
          if (!carry[product]) {
            if (Object.keys(carry).length < 10) {
              carry[product] = sale.$extras.totalProducts[product]
            }
          } else {
            carry[product] += sale.$extras.totalProducts[product]
          }
        }

        return carry
      }, {})
    )
      .map(([product, total]: [string, number]) => ({ name: product, total: total }))
      .sort((product, posProduct) => posProduct.total - product.total)

    const billingsChart = (
      await Sale.query()
        .withScopes((scope) => scope.accountScope(auth.user!.accountId))
        .preload('products')
        .whereBetween('created_at', [
          DateTime.now().plus({ months: -10 }).toISO(),
          DateTime.now().toISO(),
        ])
        .orderBy('created_at', 'asc')
    ).reduce((carry, sale) => {
      const year = sale.createdAt.year
      const month = sale.createdAt.month

      const date = year + '-' + (month < 10 ? '0' + month : month) + '-' + '10'

      let formattedDate = DateTime.fromISO(date).setLocale('pt-BR').toFormat("LLLL 'de' yyyy")

      formattedDate = formattedDate[0].toUpperCase() + formattedDate.slice(1)

      if (!carry[formattedDate]) {
        carry[formattedDate] = 0
      }

      carry[formattedDate] = carry[formattedDate] + sale.$extras.total

      return carry
    }, {})

    const productsLucrativeChart = (
      await Product.query()
        .withScopes((scopes) => scopes.accountScope(auth.user!.accountId))
        .withAggregate('sales', (query) => {
          query.whereNull('sales.deleted_at').sum('product_sale.quantity').as('total_sold')
        })
        .whereHas('sales', (query) => query.where('product_sale.quantity', '>', 0))
    ).map((product) => ({
      name: product.name,
      total: product.$extras.total_sold * product.price,
    }))

    const clientsChart = (
      await Client.query()
        .withScopes((scope) => scope.accountScope(auth.user!.accountId))
        .preload('sales', (sales) => sales.preload('products'))
        .limit(10)
    )
      .map((client) => {
        const formatter = new Intl.NumberFormat('pt-br', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })

        let total = 0

        for (const sale of client.sales) {
          total += sale.$extras.total
        }

        const formattedTotal = formatter.format(total / 100)

        return {
          name: client.name,
          email: client.email,
          phone: client.formattedPhone,
          document: client.formattedDocument,
          total: total,
          formattedTotal: formattedTotal,
        }
      })
      .filter((client) => client.total > 0)
      .sort((client, posClient) => posClient.total - client.total)

    const salesmansChart = (
      await User.query()
        .withScopes((scopes) => scopes.accountScope(auth.user!.accountId))
        .has('sales', '>', 0)
    ).map((salesman) => ({
      name: salesman.name,
      quantity: salesman.$extras.TotalSalesQuantity,
      value: salesman.$extras.formattedTotalSales,
    }))

    return view.render('dashboard', {
      productsChart: productsChart,
      billingsChart: billingsChart,
      productsLucrativeChart: productsLucrativeChart,
      clientsChart: clientsChart,
      salesmansChart: salesmansChart,
    })
  }
}
