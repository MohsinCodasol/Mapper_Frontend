import { useState } from "react";
import UploadExcel from "./components/UploadExcel";
import ColumnMapper from "./components/ColumnMapper";

export default function App() {
  const [excelData, setExcelData] = useState(null);
  const [headerDepth, setHeaderDepth] = useState(1);


  return (
    <div className="p-4 text-center">
      <h2 className="mb-4" >📊 Excel Column Mapper</h2>

      {!excelData && <UploadExcel 
      onHeadersLoaded={(data) => {
        setExcelData(data);
        setHeaderDepth(data.header_depth || 1);
      }}
      
      />}

      {excelData && (
        <ColumnMapper
          fileId={excelData.file_id}
          headers={excelData.headers}
          bases = {excelData.bases}
          headerDepth={headerDepth}
          setHeaderDepth = {setHeaderDepth}
          onReset={() => setExcelData(null)}
        />
      )}
    </div>
  );
}
