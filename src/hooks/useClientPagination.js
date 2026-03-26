import { useState, useMemo } from "react"

/**
 * Hook para paginar y ordenar datos en el cliente.
 *
 * @param {Array} allData - Todos los items
 * @param {number} [initialPerPage=10] - Items por página inicial
 * @returns {{ data, pagination, onPageChange, onPerPageChange, sortKey, sortDirection, onSortChange }}
 */
export default function useClientPagination(allData = [], initialPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [sortKey, setSortKey] = useState(null)
  const [sortDirection, setSortDirection] = useState(null)

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return allData
    return [...allData].sort((a, b) => {
      let aVal = a[sortKey]
      let bVal = b[sortKey]
      // handle nested values (e.g. "section.name") won't apply here, keep simple
      if (aVal == null) aVal = ""
      if (bVal == null) bVal = ""
      const cmp = String(aVal).localeCompare(String(bVal), "es", { numeric: true, sensitivity: "base" })
      return sortDirection === "asc" ? cmp : -cmp
    })
  }, [allData, sortKey, sortDirection])

  const total = sortedData.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(currentPage, lastPage)

  const data = useMemo(() => {
    const start = (safePage - 1) * perPage
    return sortedData.slice(start, start + perPage)
  }, [sortedData, safePage, perPage])

  const from = total === 0 ? 0 : (safePage - 1) * perPage + 1
  const to = Math.min(safePage * perPage, total)

  const onPageChange = (page) => setCurrentPage(page)

  const onPerPageChange = (newPerPage) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  const onSortChange = (key) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  return {
    data,
    pagination: { currentPage: safePage, lastPage, perPage, total, from, to },
    onPageChange,
    onPerPageChange,
    sortKey,
    sortDirection,
    onSortChange,
  }
}
