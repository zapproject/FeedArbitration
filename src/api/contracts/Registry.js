const Oracle = require('../components/Oracle');
const Base = require('./Base');
const Web3 = require('web3');
const web3 = new Web3();

class ZapRegistry extends Base {
    constructor({provider, address, artifact}) {
        super({provider: provider, address: address, artifact: artifact});
        this.getOracle = this.getOracle.bind(this);
    }

    async initiateProvider({public_key, title, endpoint, endpoint_params, from, gas}) {
        try {
            const contractInstance = await this.contractInstance();
            return await contractInstance.initiateProvider(
                public_key,
                title,
                endpoint,
                endpoint_params,
                {
                    from: from,
                    gas: gas
                }
            );
        } catch (err) {
            throw err;
        }
    }

    async initiateProviderCurve({endpoint, curve, from, gas}) {
        try {
            const contractInstance = await this.contractInstance();
            return await contractInstance.initiateProviderCurve(
                endpoint,
                curve.constants,
                curve.parts,
                curve.dividers,
                {
                    'from': from,
                    'gas': gas
                }
            );
        } catch (err) {
            throw err;
        }
    }

    // bytes32 specifier, bytes32[] endpoint_params
    async setEndpointParams({endpoint, params, from, gas}) {
        try {
            const contractInstance = await this.contractInstance();
            let endpoint_params = [];
            params.forEach(el => endpoint_params.push(web3.utils.utf8ToHex(el)));
            return await contractInstance.setEndpointParams(
                endpoint,
                endpoint_params,
                {
                    'from': from,
                    'gas': gas
                }
            );
        } catch (err) {
            throw err;
        }
    }

    // get oracle by address
    async getOracle({address, endpoint}) {
        try {
            const contractInstance = await this.contractInstance();
            const oracle = new Oracle(this);
            oracle.address = address;

            // Get the provider's public getRouteKeys
            oracle.public_key = await contractInstance.getProviderPublicKey(address);

            // // Get the route keys next
            // getNextEndpointParam address provider, bytes32 specifier, uint256 index
            let i = 0;
            let endpoint_params = [];
            while (true) {
                try {
                    if (i >= 50) break;
                    const result = await contractInstance.getNextEndpointParam(
                        address,
                        endpoint,
                        i
                    );
                    endpoint_params.push(result[1]);
                    if (!result[0].toNumber()) break;
                    i++
                } catch (err) {
                    console.log(err);
                    break;
                }
            }
            oracle.endpoint_params = endpoint_params;
            // // Output loaded object
            return oracle;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ZapRegistry;
