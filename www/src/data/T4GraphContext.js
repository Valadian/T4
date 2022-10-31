async function Query(operationName, operationDoc, variables, accessToken) {
  var headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  var graph_url = process.env.REACT_APP_GRAPH_URL;

  return fetch(graph_url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      query: operationDoc,
      variables: variables ?? {},
      operationName: operationName,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      if (json.errors && json.errors.length > 0) {
        console.error(json.errors);
        // console.log(operationDoc);
        // console.log(variables);
        // console.log(accessToken);
        // throw new Error("Graphql query has error, see console")
        return Promise.reject(json.errors);
      }
      if (json.data) {
        // console.log(json.data);
        return Promise.resolve(json.data);
      } else {
        return Promise.reject("No Data Returned");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

export default Query;
