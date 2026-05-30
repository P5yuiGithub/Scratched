type NodeDefinition = {
    inputs: string[];
    outputs: string[];
    execute: (inputs: Record<string, any>) => (Record<string, any>)
}

export const registry: Record<string, NodeDefinition> = {
    'Print': {
        inputs: ['value'],
        outputs: [],
        execute: ({value}) => {
            console.log(value);
            return {};
        }
    },
    'Test': {
        inputs: ['value', 'value'],
        outputs: ['value', 'value'],
        execute: ({value}) => {
            console.log(value);
            return {};
        }
    },
    'String': {
        inputs: [],
        outputs: ['value'],
        execute: () => ({
            value: 'Hello World'
        })
    }
}