import axios from "axios";

const tenantId = window.location.hostname.split('.')[0];
axios.defaults.baseURL = `https://${tenantId}.emrcore.com.tr/api`;
