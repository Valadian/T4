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
        console.log(json.data);
        return Promise.resolve(json.data)
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

export default Query