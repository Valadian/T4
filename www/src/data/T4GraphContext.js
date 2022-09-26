function Query(operationName, operationDoc,variables) {
    return fetch(
        "http://localhost:8080/v1/graphql",
        {
            method: "POST",
            body: JSON.stringify({
                query: operationDoc,
                variables: variables??{},
                operationName: operationName
            })
        }
    )
    .then((response) => response.json())
    .then((json) => {
        if(json.errors && json.errors.length>0){
            console.error(json.errors);
            throw new Error("Graphql query has error, see console")
        }
        // console.log(json.data);
        return Promise.resolve(json.data)
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

export default Query