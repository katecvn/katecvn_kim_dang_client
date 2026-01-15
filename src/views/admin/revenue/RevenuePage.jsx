import { DateRange } from '@/components/custom/DateRange'
import EmptyState from '@/components/custom/EmptyState'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/utils/axios'
import { moneyFormat } from '@/utils/money-format'
import { endOfMonth, startOfMonth } from 'date-fns'
import React, { useCallback, useEffect, useState } from 'react'

const RevenuePage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  const current = new Date()
  const [filters, setFilters] = useState({
    fromDate: startOfMonth(current),
    toDate: endOfMonth(current),
  })

  const fetchRevenue = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/statistic/get-sale-report', {
        params: { fromDate: filters.fromDate, toDate: filters.toDate },
      })
      setData(data.data)
      setLoading(false)
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }, [filters])

  useEffect(() => {
    fetchRevenue()
  }, [fetchRevenue])

  const groupByCategoryType = (data = []) => {
    const result = data?.reduce((acc, item) => {
      if (!acc[item.categoryType]) acc[item.categoryType] = []
      acc[item.categoryType].push(item)
      return acc
    }, {})
    // Chuyển object thành mảng và sắp xếp theo `categoryType`
    return Object.fromEntries(
      Object.entries(result).sort(([a], [b]) => (a === 'company' ? -1 : 1)),
    )
  }

  const calculateTotalRevenue = (data, key) => {
    return Object.values(groupByCategoryType(data))
      .flat()
      .reduce((sum, item) => sum + item[key], 0)
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 sm:flex-nowrap">
          <h2 className="text-2xl font-bold tracking-tight">Doanh thu tháng</h2>

          <div>
            <DateRange
              defaultValue={{
                from: filters?.fromDate,
                to: filters?.toDate,
              }}
              onChange={(range) => {
                setFilters((prev) => ({
                  ...prev,
                  fromDate: range?.from || startOfMonth(current),
                  toDate: range?.to || endOfMonth(current),
                }))
              }}
            />
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="space-y-4">
            <div className="rounded-lg">
              <h2 className="text-lg font-bold">Doanh thu công ty</h2>

              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 dark:bg-primary-foreground">
                    <th className="w-[300px] border p-2">Nguồn</th>
                    <th className="w-[300px] border p-2">Danh mục</th>
                    <th className="w-[300px] border p-2">
                      Doanh thu chưa hệ số
                    </th>
                    <th className="w-[300px] border p-2">Doanh thu có hệ số</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <tr key={`company-${index}`} className="border">
                          <td className="border p-2">
                            <Skeleton className="h-[20px] w-full rounded-md" />
                          </td>
                          <td className="border p-2">
                            <Skeleton className="h-[20px] w-full rounded-md" />
                          </td>
                          <td className="border p-2">
                            <Skeleton className="h-[20px] w-full rounded-md" />
                          </td>
                          <td className="border p-2">
                            <Skeleton className="h-[20px] w-full rounded-md" />
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : data?.revenueOfCompany.length > 0 ? (
                    <>
                      {Object.entries(
                        groupByCategoryType(data?.revenueOfCompany),
                      ).map(([categoryType, items]) => {
                        const totalWithoutCoefficient = items.reduce(
                          (sum, item) => sum + item.withoutCoefficient,
                          0,
                        )
                        const totalWithCoefficient = items.reduce(
                          (sum, item) => sum + item.withCoefficient,
                          0,
                        )

                        return (
                          <React.Fragment key={categoryType}>
                            {items.map((item, index) => (
                              <tr key={item.categoryId} className="border">
                                {index === 0 && (
                                  <td
                                    className="border p-2 text-center font-semibold"
                                    rowSpan={items.length + 1}
                                  >
                                    {categoryType === 'company'
                                      ? 'Công ty'
                                      : 'Đối tác'}
                                  </td>
                                )}
                                <td className="border p-2">
                                  {item.categoryName}
                                </td>
                                <td className="border p-2 text-end">
                                  {moneyFormat(item.withoutCoefficient)}
                                </td>
                                <td className="border p-2 text-end">
                                  {moneyFormat(item.withCoefficient)}
                                </td>
                              </tr>
                            ))}

                            <tr
                              key={`total-${categoryType}`}
                              className="border bg-orange-200 font-semibold dark:bg-orange-400"
                            >
                              <td className="border p-2 text-center">
                                Tổng cộng
                              </td>
                              <td className="border p-2 text-end">
                                {moneyFormat(totalWithoutCoefficient)}
                              </td>
                              <td className="border p-2 text-end">
                                {moneyFormat(totalWithCoefficient)}
                              </td>
                            </tr>
                          </React.Fragment>
                        )
                      })}

                      <tr className="border bg-green-200 font-bold dark:bg-green-400">
                        <td colSpan={2} className="border text-center">
                          Tổng doanh thu
                        </td>
                        <td className="border p-2 text-end">
                          {moneyFormat(
                            calculateTotalRevenue(
                              data?.revenueOfCompany,
                              'withoutCoefficient',
                            ),
                          )}
                        </td>
                        <td className="border p-2 text-end">
                          {moneyFormat(
                            calculateTotalRevenue(
                              data?.revenueOfCompany,
                              'withCoefficient',
                            ),
                          )}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center">
                        <EmptyState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg">
              {data?.revenueOfUser?.map((user) => (
                <div key={user.userName} className="mt-8 rounded-lg">
                  <h2 className="text-lg font-bold">
                    Doanh thu: {user.userName}
                  </h2>
                  <table className="mt-2 w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-primary-foreground">
                        <th className="w-[300px] border p-2">Nguồn</th>
                        <th className="w-[300px] border p-2">Danh mục</th>
                        <th className="w-[300px] border p-2">
                          Doanh thu chưa hệ số
                        </th>
                        <th className="w-[300px] border p-2">
                          Doanh thu có hệ số
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <>
                          {Array.from({ length: 10 }).map((_, index) => (
                            <tr key={`user-${index}`} className="border">
                              <td className="border p-2">
                                <Skeleton className="h-[20px] w-full rounded-md" />
                              </td>
                              <td className="border p-2">
                                <Skeleton className="h-[20px] w-full rounded-md" />
                              </td>
                              <td className="border p-2">
                                <Skeleton className="h-[20px] w-full rounded-md" />
                              </td>
                              <td className="border p-2">
                                <Skeleton className="h-[20px] w-full rounded-md" />
                              </td>
                            </tr>
                          ))}
                        </>
                      ) : user?.detail.length > 0 ? (
                        <>
                          {Object.entries(
                            groupByCategoryType(user?.detail),
                          ).map(([categoryType, items]) => {
                            const totalWithoutCoefficient = items.reduce(
                              (sum, item) => sum + item.withoutCoefficient,
                              0,
                            )
                            const totalWithCoefficient = items.reduce(
                              (sum, item) => sum + item.withCoefficient,
                              0,
                            )

                            return (
                              <React.Fragment key={`category-${categoryType}`}>
                                {items.map((item, index) => (
                                  <tr key={item.categoryId} className="border">
                                    {index === 0 && (
                                      <td
                                        className="border p-2 text-center font-semibold"
                                        rowSpan={items.length + 1}
                                      >
                                        {categoryType === 'company'
                                          ? 'Công ty'
                                          : 'Đối tác'}
                                      </td>
                                    )}
                                    <td className="border p-2">
                                      {item.categoryName}
                                    </td>
                                    <td className="border p-2 text-end">
                                      {moneyFormat(item.withoutCoefficient)}
                                    </td>
                                    <td className="border p-2 text-end">
                                      {moneyFormat(item.withCoefficient)}
                                    </td>
                                  </tr>
                                ))}

                                <tr className="border bg-orange-200 font-semibold dark:bg-orange-400">
                                  <td className="border p-2 text-center">
                                    Tổng cộng
                                  </td>
                                  <td className="border p-2 text-end">
                                    {moneyFormat(totalWithoutCoefficient)}
                                  </td>
                                  <td className="border p-2 text-end">
                                    {moneyFormat(totalWithCoefficient)}
                                  </td>
                                </tr>
                              </React.Fragment>
                            )
                          })}

                          <tr className="border bg-green-200 font-bold dark:bg-green-400">
                            <td colSpan={2} className="border text-center">
                              Tổng doanh thu
                            </td>
                            <td className="border p-2 text-end">
                              {moneyFormat(
                                calculateTotalRevenue(
                                  user?.detail,
                                  'withoutCoefficient',
                                ),
                              )}
                            </td>
                            <td className="border p-2 text-end">
                              {moneyFormat(
                                calculateTotalRevenue(
                                  user?.detail,
                                  'withCoefficient',
                                ),
                              )}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center">
                            <EmptyState />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default RevenuePage
