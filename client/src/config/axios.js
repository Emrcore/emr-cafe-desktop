import axios from "axios";

const host = window.location.hostname; // örn: demo.cafe.emrcore.com.tr
const tenantId = host.split(".")[0];   // örn: demo

axios.defaults.baseURL = `https://${tenantId}.cafe.emrcore.com.tr/api`;

export default axios;
