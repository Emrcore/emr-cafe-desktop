import axios from "axios";

const host = window.location.hostname; // �rn: demo.cafe.emrcore.com.tr
const tenantId = host.split(".")[0];   // �rn: demo

axios.defaults.baseURL = `https://${tenantId}.cafe.emrcore.com.tr/api`;

export default axios;
