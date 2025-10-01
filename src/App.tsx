import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";

interface Artwork {
  id: number;
  title: string;
  artist_display?: string;
}


export default function App() {

  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rows, setRows] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);


  const fetchData = async (pageNumber: number, pageSize: number) => {
    setLoading(true);
    try {
      const res = await axios.get("https://api.artic.edu/api/v1/artworks", { params: { page: pageNumber + 1, limit: pageSize } });
      console.log(res.data.pagination);
      
      setData(res.data.data || []);
      setTotalRecords(res.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page, rows); }, [page, rows]);

  const onPage = (e: any) => { 
    setPage(e.page); setRows(e.rows); 
  };

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const currentPageIds = data.map(d => d.id);
    let newSelected: number[] = [...selectedIds];

    e.value.forEach(r => { if (!newSelected.includes(r.id)) newSelected.push(r.id); });
    currentPageIds.forEach(id => { if (!e.value.some(r => r.id === id)) newSelected = newSelected.filter(x => x !== id); });

    setSelectedIds(newSelected);
  };

  const selectionForPage = data.filter(d => selectedIds.includes(d.id));

  return (
    <div className="p-4 bg-gray-50 h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Server Pagination TABLE</h2>

      <DataTable
        value={data}
        paginator
        lazy
        rows={rows}
        totalRecords={totalRecords}
        first={page * rows}
        onPage={onPage}
        loading={loading}
        selection={selectionForPage}
        onSelectionChange={onSelectionChange}
        dataKey="id"
        className="shadow-lg bg-white rounded-md"
      >
        <Column selectionMode="multiple" style={{ width: '3rem' }} />
        <Column field="id" header="ID" />
        <Column field="title" header="Title" />
        <Column field="artist_display" header="Artist" />
      </DataTable>

      <div className="mt-6 p-4 bg-white rounded-md shadow">
        <h3 className="font-semibold mb-2 text-gray-700">Selected Row IDs:</h3>
        <div className="flex flex-wrap gap-2">
          {selectedIds.map(id => (
            <span key={id} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">{id}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
