import { cn } from "@/lib/utils"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"

const PER_PAGE_OPTIONS = ["10", "15", "25", "50"]

function getPageNumbers(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push("...")
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < last - 2) pages.push("...")
  pages.push(last)
  return pages
}

/**
 * DataTable reutilizable con responsive, paginación y ordenamiento.
 *
 * @param {object} props
 * @param {Array} props.columns - [{key, label, render?, primary?, hideOnMobile?, className?, sortable?}]
 * @param {Array} props.data - items de la página actual
 * @param {object} [props.pagination] - {currentPage, lastPage, perPage, total, from, to}
 * @param {Function} [props.onPageChange]
 * @param {Function} [props.onPerPageChange]
 * @param {string} [props.sortKey] - columna activa de ordenamiento
 * @param {string} [props.sortDirection] - "asc" | "desc" | null
 * @param {Function} [props.onSortChange] - (key) => void
 * @param {boolean} [props.loading]
 * @param {string} [props.emptyMessage]
 * @param {Function} [props.actions] - (item) => JSX de acciones
 */
export default function DataTable({
  columns = [],
  data = [],
  pagination,
  onPageChange,
  onPerPageChange,
  sortKey,
  sortDirection,
  onSortChange,
  loading = false,
  emptyMessage = "No se encontraron registros",
  actions,
}) {
  const visibleColumns = columns
  const mobileColumns = columns.filter((c) => !c.hideOnMobile)
  const primaryCol = columns.find((c) => c.primary) || columns[0]
  const detailCols = mobileColumns.filter((c) => c !== primaryCol)
  const totalCols = visibleColumns.length + (actions ? 1 : 0)

  const renderCellValue = (col, item) =>
    col.render ? col.render(item) : String(item[col.key] ?? "-")

  const renderSortIcon = (col) => {
    if (!onSortChange || col.sortable === false) return null
    const isActive = sortKey === col.key
    const Icon = isActive
      ? sortDirection === "asc" ? ArrowUp : ArrowDown
      : ArrowUpDown
    return (
      <Icon className={cn(
        "h-3.5 w-3.5 shrink-0 transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground/50"
      )} />
    )
  }

  const handleHeaderClick = (col) => {
    if (!onSortChange || col.sortable === false) return
    onSortChange(col.key)
  }

  return (
    <div className="space-y-3">
      {/* Desktop table */}
      <div className="rounded-xl bg-muted/30 dark:bg-card hidden sm:block overflow-hidden p-6">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    col.className,
                    onSortChange && col.sortable !== false && "cursor-pointer select-none hover:text-foreground"
                  )}
                  onClick={() => handleHeaderClick(col)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {renderSortIcon(col)}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={totalCols} className="text-center py-8 text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalCols} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, idx) => (
                <TableRow key={item.id ?? idx}>
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {renderCellValue(col, item)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">{actions(item)}</div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Cargando...</p>
        ) : data.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">{emptyMessage}</p>
        ) : (
          data.map((item, idx) => (
            <div key={item.id ?? idx} className="rounded-xl bg-muted/40 dark:bg-card p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm">
                  {renderCellValue(primaryCol, item)}
                </span>
                {actions && <div className="flex gap-1 shrink-0">{actions(item)}</div>}
              </div>
              {detailCols.length > 0 && (
                <div className="grid gap-1 text-sm">
                  {detailCols.map((col) => (
                    <div key={col.key} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{col.label}</span>
                      <span className="text-right">{renderCellValue(col, item)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination footer */}
      {pagination && pagination.total > 0 && (
        <>
          {/* Desktop pagination */}
          <div className="hidden sm:flex items-center justify-between gap-4 pt-1">
            <p className="text-sm text-muted-foreground shrink-0">
              Mostrando {pagination.from}-{pagination.to} de {pagination.total}
            </p>
            {pagination.lastPage > 1 && (
              <div className="flex items-center gap-1">
                {getPageNumbers(pagination.currentPage, pagination.lastPage).map((p, i) =>
                  p === "..." ? (
                    <span key={`e${i}`} className="px-1 text-muted-foreground text-sm">...</span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === pagination.currentPage ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => onPageChange?.(p)}
                      disabled={p === pagination.currentPage}
                    >
                      {p}
                    </Button>
                  )
                )}
              </div>
            )}
            {onPerPageChange && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-muted-foreground">Por página</span>
                <Select
                  value={String(pagination.perPage)}
                  onValueChange={(v) => onPerPageChange?.(Number(v))}
                >
                  <SelectTrigger className="w-18 h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PER_PAGE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Mobile pagination */}
          <div className="flex sm:hidden items-center justify-between gap-2 pt-1">
            {pagination.lastPage > 1 ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Pág {pagination.currentPage} de {pagination.lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.lastPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground w-full text-center">
                {pagination.total} {pagination.total === 1 ? "registro" : "registros"}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
