import axios from "axios";
//const LocalURL = "http://localhost:8000/api/excel";
const LocalURL = "https://2w2kvbg9-8000.inc1.devtunnels.ms/api/excel";

const API = axios.create({
  baseURL: LocalURL,
});

export const uploadExcel = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/upload", formData);
};

export const fetchHeaders = (file_id, header_depth) => {
  return API.post("/headers", {
    file_id:file_id,
    header_depth:header_depth,
}
);
};

export const transformExcel = (payload) => {
  return API.post("/transform", payload);
};
