import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/custom/Button'
import api from '@/utils/axios'
import { createOrUpdateBusinessPlans } from '@/stores/BusinessPlanSlice'
import { Skeleton } from '@/components/ui/skeleton'

const generateDefaultPlans = (year) => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: (i + 1).toString(),
    year: year.toString(),
    companyRevenueEst: 0,
    partnerRevenueEst: 0,
  }))
}

const BusinessPlanPage = () => {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const [plans, setPlans] = useState()
  const [loading, setLoading] = useState(false)
  const getBusinessPlans = async ({ year }) => {
    setLoading(true)
    try {
      const response = await api.get('/business-plan', { params: { year } })
      const { data } = response.data
      setPlans(data.length > 0 ? data : generateDefaultPlans(year))
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log('Submit error: ', error)
    }
  }

  const form = useForm()
  const dispatch = useDispatch()
  useEffect(() => {
    getBusinessPlans({ year: selectedYear })
    form.reset()
  }, [dispatch, selectedYear, form])

  const navigate = useNavigate()
  const onSubmit = async () => {
    setLoading(true)
    const dataToSend = {
      months: plans,
      year: selectedYear,
    }
    try {
      await dispatch(createOrUpdateBusinessPlans(dataToSend)).unwrap()
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log('Submit error: ', error)
    }
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Kế hoạch kinh doanh
          </h2>

          <Select
            value={selectedYear.toString()}
            onValueChange={(year) => setSelectedYear(year)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(7)].map((_, index) => {
                const year = currentYear - 5 + index
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {loading
                  ? Array.from({ length: 12 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Skeleton className="h-[20px] w-full rounded-md" />
                      </div>
                    ))
                  : plans?.map((plan, index) => (
                      <div
                        key={index}
                        className="space-y-2 rounded-lg border p-4"
                      >
                        <Label
                          id={index}
                          className="font-semibold"
                        >{`Tháng ${plan.month}/${plan.year}`}</Label>

                        <div className="my-2">
                          <Label htmlFor={`${index}-company`}>
                            Doanh thu công ty
                          </Label>
                          <Input
                            id={`${index}-company`}
                            placeholder="Doanh thu công ty"
                            value={
                              plan.companyRevenueEst
                                ? new Intl.NumberFormat('vi-VN').format(
                                    plan.companyRevenueEst,
                                  )
                                : ''
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(
                                /[^\d]/g,
                                '',
                              )
                              const numericValue = rawValue
                                ? Number(rawValue)
                                : ''
                              const updatedPlans = [...plans]
                              updatedPlans[index] = {
                                ...plan,
                                companyRevenueEst: numericValue,
                              }
                              setPlans(updatedPlans)
                            }}
                          />
                        </div>

                        <div className="my-2">
                          <Label htmlFor={`${index}-partner`}>
                            Doanh thu đối tác
                          </Label>
                          <Input
                            id={`${index}-partner`}
                            placeholder="Doanh thu đối tác"
                            value={
                              plan.partnerRevenueEst
                                ? new Intl.NumberFormat('vi-VN').format(
                                    plan.partnerRevenueEst,
                                  )
                                : ''
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(
                                /[^\d]/g,
                                '',
                              )
                              const numericValue = rawValue
                                ? Number(rawValue)
                                : ''
                              const updatedPlans = [...plans]
                              updatedPlans[index] = {
                                ...plan,
                                partnerRevenueEst: numericValue,
                              }
                              setPlans(updatedPlans)
                            }}
                          />
                        </div>
                      </div>
                    ))}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-2 w-32"
                  onClick={() => navigate(-1)}
                >
                  <IconArrowLeft className="h-4 w-4" /> Quay lại
                </Button>

                <Button type="submit" className="w-32" loading={loading}>
                  {!loading && <IconRefresh className="mr-2 h-4 w-4" />} Cập
                  nhật
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default BusinessPlanPage
