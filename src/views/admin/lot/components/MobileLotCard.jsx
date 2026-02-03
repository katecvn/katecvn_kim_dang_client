import { Button } from '@/components/custom/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import ViewLotDialog from './ViewLotDialog' // Assuming this exists or I'll use the one I created
import { DataTableRowAction } from './DataTableRowAction'
import { dateFormat } from '@/utils/date-format'

const MobileLotCard = ({ lot, isSelected, onSelectChange }) => {
  const [showViewDialog, setShowViewDialog] = useState(false)

  return (
    <>
      {showViewDialog && (
        <ViewLotDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          lotId={lot.id}
        />
      )}

      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelectChange}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <CardTitle
                  className="line-clamp-2 cursor-pointer text-sm font-semibold hover:text-primary"
                  onClick={() => setShowViewDialog(true)}
                >
                  {lot.code}
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {lot.product?.name || 'N/A'}
                </p>
              </div>
            </div>
            <DataTableRowAction row={{ original: lot }} />
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-[10px] text-muted-foreground">Số lượng</p>
              <p className="font-medium">{lot.currentQuantity}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">NSX</p>
              <p className="font-medium">{dateFormat(lot.manufactureDate)}</p>
            </div>
          </div>
          <div className="text-xs">
            <p className="text-[10px] text-muted-foreground">HSD</p>
            <p className="font-medium">{dateFormat(lot.expiryDate)}</p>
          </div>

          <div className="flex gap-2 border-t pt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 text-xs"
              onClick={() => setShowViewDialog(true)}
            >
              Xem chi tiết
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default MobileLotCard
