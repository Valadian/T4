import React, { useState, useEffect } from "react";
import TournamentSummary from "./TournamentSummary";
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import Pagination from 'react-bootstrap/Pagination';


const operationsDoc = `
  query AllTournaments($whereExpr: Tournament_bool_exp, $pageSize: Int = 20, $offset: Int = 0, $orderBy: order_by = asc ) {
    Tournament_aggregate(where: $whereExpr) {
      aggregate {
        totalCount: count
      }
    }
    Tournament(limit: $pageSize, offset: $offset, where: $whereExpr, order_by: {start: $orderBy}) {
      id
      short_name
      name
      location
      start
      public
      Ladder_aggregate {
        aggregate {
          count
        }
      }
      Ladder {
        User {
          id
          name
        }
      }
      Game {
        value
      }
      Creator {
        id
        name
      }
      Rounds {
        finalized
      }
    }
  }
`;

export default function TournamentList(props) {
  const [tournaments, setTournaments] = useState([]);
  const { user, getAccessTokenSilently } = useAuth0();
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(props.pageSize??10);
  const [page, setPage] = useState(1);

  let num_pages = Math.ceil(totalCount/pageSize)
  let pages = []
  if(num_pages>=1){
    pages.push(<Pagination.Item key="first" disabled={page === 1} onClick={() => setPage(1)}><i className="bi bi-caret-left-fill"></i><i className="bi bi-caret-left-fill" style={{marginLeft:"-10px"}}></i><i className="bi bi-caret-left-fill" style={{marginLeft:"-10px"}}></i></Pagination.Item>);
    pages.push(<Pagination.Item key="-1" disabled={page === 1} onClick={() => setPage(p => Math.max(1,p-1))}><i className="bi bi-caret-left-fill"></i></Pagination.Item>);
    for (let i = 1; i<=num_pages; i++){
      pages.push(<Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>{i}</Pagination.Item>);
    } 
    pages.push(<Pagination.Item key="+1" disabled={page === num_pages} onClick={() => setPage(p => Math.min(num_pages,p+1))}><i className="bi bi-caret-right-fill"></i></Pagination.Item>);
    pages.push(<Pagination.Item key="last" disabled={page === num_pages} onClick={() => setPage(num_pages)}><i className="bi bi-caret-right-fill"></i><i className="bi bi-caret-right-fill" style={{marginLeft:"-10px"}}></i><i className="bi bi-caret-right-fill" style={{marginLeft:"-10px"}}></i></Pagination.Item>);
    pages.push(<Pagination.Item className="d-none d-sm-inline" key="count" disabled={true}>{totalCount+" Event"+(totalCount>0?"s":"")}</Pagination.Item>);
  }
  useEffect(() => {
    let num_pages = Math.ceil(totalCount/pageSize)
    if(num_pages>0 && page>num_pages){
      setPage(num_pages)
    }
  }, [totalCount, page, pageSize])
  useEffect(() => {
    let where_expression = {};
    if (props.filter) {
      if(props.filter["location"]){
        where_expression['location'] = { 
          _eq: props.filter["location"] 
        }
      }
      if(props.filter["earliest"] || props.filter["latest"]){
        where_expression['start'] = {
          _gte: props.filter["earliest"],
          _lte: props.filter["latest"],
        }
      }
      // {_or: [
      //   {Creator: {id: {_eq: "google-oauth2|103553652899639741420"}}}, 
      //   {Ladder: {User: {id: {_eq: "google-oauth2|103553652899639741420"}}}}
      // ]}
      if(props.filter["creator_id"] || props.filter["player_id"]){
        where_expression['_or'] = []
        if(props.filter["creator_id"]){
          where_expression['_or'].push({Creator: { id: {
            _eq: props.filter["creator_id"] 
          }}})
        }
        if(props.filter["player_id"]){
          where_expression['_or'].push({Ladder: { User: { id: { 
            _eq: props.filter["player_id"] 
          }}}})
        }
      }
      if(props.filter['live']){
        where_expression['Rounds'] = {finalized: {_eq: false}}
      }
      if(props.filter["game"]){
        where_expression['_and'] = [{_or :props.filter["game"].map(g => {return {game:{_eq:g}}})}]
      }
      if(props.filter["search"]){
        where_expression['_or'] = [
          {name: {_ilike: "%"+props.filter["search"]+"%"}},
          {location: {_ilike: "%"+props.filter["search"]+"%"}},
          {description: {_ilike: "%"+props.filter["search"]+"%"}}
        ]
      }
    }
    const fetchData = async () => {
      var accessToken = undefined
      if (user) {
        accessToken = await getAccessTokenSilently()
      }
      Query("AllTournaments", operationsDoc,{
        whereExpr: where_expression,
        pageSize: pageSize,
        offset: (page-1)*pageSize,
        orderBy: props.orderBy??"asc"
      },accessToken)
        .then((data)=> {
          if (data){
            setTotalCount(data.Tournament_aggregate.aggregate.totalCount)
            setTournaments(data.Tournament)
          }
        });
    }
    fetchData();
        
  }, [getAccessTokenSilently, props.filter, props.orderBy, user, page, pageSize])
    
  return (
    <>
    {totalCount>pageSize?<Pagination>{pages}</Pagination>:<></>}
    {tournaments.length===0?<p className="text-danger">No Matches Found</p>:<></>}
    {tournaments.map((tourn) => <TournamentSummary key={tourn.id} data={tourn} />)}
    </>
  )
 }