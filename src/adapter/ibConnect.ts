import IBApi from "@stoqey/ib";

const ib = new IBApi({
    port: 4002,
    clientId: 0,
});

export default ib;