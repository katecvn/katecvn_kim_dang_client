import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { diffForHumans } from '@/utils/date-format'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrashIcon } from '@radix-ui/react-icons'
import EmptyState from '@/components/custom/EmptyState'
import MapComponent from './MapComponent'

const SchoolLogDialog = ({ school, showTrigger = true, ...props }) => {
  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-4xl md:h-auto">
        <DialogHeader>
          <DialogTitle>Lịch sử đăng nhập trường: {school.name}</DialogTitle>
          <DialogDescription>
            Dưới đây là lịch sử đăng nhập gần nhất:{' '}
            <strong>{school.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <Accordion type="single" collapsible>
            {school?.logs?.length ? (
              school?.logs?.map((log, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    {log.user.fullName}
                    <div className="ml-auto pr-1 text-xs font-normal text-muted-foreground ">
                      <p>
                        {!log.logoutAt
                          ? diffForHumans(log.loginAt)
                          : 'Đã đăng xuất'}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex justify-between">
                      <div className=" content-center text-sm font-normal text-muted-foreground ">
                        <p className="mb-1">
                          <span className="font-bold">Thiết bị: </span>
                          {log.userAgent}
                        </p>
                        {log.location.status !== 'fail' && (
                          <p>
                            {log.location.city + ', ' + log.location.country}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="my-3">
                      <MapComponent
                        position={log.location}
                        key={`map-${index}`}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <EmptyState />
            )}
          </Accordion>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button>Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SchoolLogDialog
