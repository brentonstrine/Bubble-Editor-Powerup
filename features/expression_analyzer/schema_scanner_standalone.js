(function() {
    console.log("❤️ [Codeless Love] 🔍 Starting Standalone App Schema Scan...");
    
    if (typeof window.appquery === 'undefined') {
        console.error("❌ appquery not found. Ensure you are in the Bubble Editor and running this in the correct context (usually 'top').");
        return;
    }

    const SCHEMA_KEY = 'CL_AppSchema';
    const schema = { 
        customTypes: {}, 
        optionSets: {}, 
        elements: {},
        lastScanned: new Date().toISOString() 
    };
    
    try {
        console.group("❤️ [Codeless Love] 🔍 Scanning App Schema...");

        // 1. Scan Custom Data Types
        const types = appquery.custom_types ? appquery.custom_types() : [];
        console.log(`Found ${types.length} Custom Data Types.`);
        
        types.forEach(typeNode => {
            const node = typeNode.json;
            const typeId = node.__name;
            const typeName = node.child('%nm').raw() || node.child('%dn').raw() || node.child('name').raw() || typeId;
            
            schema.customTypes[typeId] = { name: typeName, fields: {} };
            console.groupCollapsed(`  Type: ${typeName} (${typeId})`);
            
            const fieldsBranch = node.child('fields');
            if (fieldsBranch.exists()) {
                fieldsBranch.child_names().forEach(fId => {
                    const fNode = fieldsBranch.child(fId);
                    let fName = fNode.child('%nm').raw() || fNode.child('%dn').raw() || fNode.child('name').raw() || fId;
                    let fType = fNode.child('type').raw();
                    const isList = fNode.child('is_list').raw() === true || fId.includes('_list_');

                    // Fallback type extraction from key
                    if (!fType && fId.includes('_')) {
                        const parts = fId.split('_');
                        fType = parts[parts.length - 1];
                    }

                    schema.customTypes[typeId].fields[fId] = {
                        name: fName,
                        type: fType || 'unknown',
                        isList: isList
                    };
                    console.log(`    Field: ${fName} [${fType || 'unknown'}] ${isList ? '(List)' : ''}`);
                });
            }
            console.groupEnd();
        });

        // 2. Scan Option Sets (Including Attributes/Fields)
        const optionSets = appquery.option_sets ? appquery.option_sets() : [];
        console.log(`Found ${optionSets.length} Option Sets.`);
        
        optionSets.forEach(osNode => {
            const node = osNode.json;
            const osId = node.__name;
            const osName = node.child('%nm').raw() || node.child('%dn').raw() || node.child('name').raw() || osId;
            
            schema.optionSets[osId] = { name: osName, attributes: {}, options: [] };
            console.groupCollapsed(`  OS: ${osName} (${osId})`);

            const fieldsBranch = node.child('fields');
            if (fieldsBranch.exists()) {
                fieldsBranch.child_names().forEach(fId => {
                    const fNode = fieldsBranch.child(fId);
                    const fName = fNode.child('%nm').raw() || fNode.child('%dn').raw() || fNode.child('name').raw() || fId;
                    const fType = fNode.child('type').raw();
                    schema.optionSets[osId].attributes[fId] = { name: fName, type: fType };
                    console.log(`    Attr: ${fName} [${fType}]`);
                });
            }

            const optionsBranch = node.child('options');
            if (optionsBranch.exists()) {
                schema.optionSets[osId].options = optionsBranch.child_names().map(oId => {
                    const oNode = optionsBranch.child(oId);
                    const oName = oNode.child('%nm').raw() || oNode.child('%dn').raw() || oNode.child('value').raw() || oId;
                    return { id: oId, name: oName };
                });
                console.log(`    Options: ${schema.optionSets[osId].options.length} items`);
            }
            console.groupEnd();
        });

        // 3. Scan Custom/Reusable Elements (States/Properties)
        if (appquery.elements) {
            const reusables = appquery.elements().filter(el => el.json.child('is_reusable').raw());
            console.log(`Found ${reusables.length} Reusable Elements.`);

            reusables.forEach(elNode => {
                const node = elNode.json;
                const elId = node.__name;
                const elName = node.child('%nm').raw() || node.child('name').raw();
                
                schema.elements[elId] = { name: elName, states: {} };
                console.groupCollapsed(`  Element: ${elName} (${elId})`);

                const statesBranch = node.child('states');
                if (statesBranch.exists()) {
                    statesBranch.child_names().forEach(sId => {
                        const sNode = statesBranch.child(sId);
                        const sName = sNode.child('%nm').raw() || sNode.child('name').raw() || sId;
                        const sType = sNode.child('type').raw();
                        schema.elements[elId].states[sId] = { name: sName, type: sType };
                        console.log(`    State: ${sName} [${sType}]`);
                    });
                }
                console.groupEnd();
            });
        }

        localStorage.setItem(SCHEMA_KEY, JSON.stringify(schema));
        console.groupEnd();
        console.log("❤️ [Codeless Love] ✅ Scan Complete. Saved to localStorage.CL_AppSchema");
        console.log("--- COPY THE JSON BELOW ---");
        console.log(JSON.stringify(schema, null, 2));
    } catch (e) {
        console.error("❌ Schema Scan Failed:", e);
    }
})();
