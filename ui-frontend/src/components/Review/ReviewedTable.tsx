import React, {FunctionComponent, useEffect, useState} from 'react';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Table, {Column} from 'aws-northstar/components/Table';
import {IRequest, ReduxRoot} from "../../interfaces";
import {
  getProcessedRequests,
} from "../../data";
import Flashbar, {FlashbarMessage} from "aws-northstar/components/Flashbar";
import {useSelector} from "react-redux";

const columnDefinitions: Column<IRequest>[] = [
  {
    id: 'requester',
    width: 150,
    Header: 'Requester',
    accessor: 'requester'
  },
  {
    id: 'reviewer',
    width: 150,
    Header: 'Reviewer',
    accessor: 'reviewer'
  },
  {
    id: 'request_account',
    width: 150,
    Header: 'Account',
    accessor: 'request_account'
  },
  {
    id: 'request_role',
    width: 200,
    Header: 'Role',
    accessor: 'request_role'
  },
  {
    id: 'request_duration',
    width: 100,
    Header: 'Duration',
    accessor: 'request_duration'
  },
  {
    id: 'request_justification',
    width: 200,
    Header: 'Justification',
    accessor: 'request_justification'
  },
  {
    id: 'request_status',
    width: 100,
    Header: 'Status',
    Cell: ({ row }: any) => {
      if (row && row.original) {
        const status = row.original.request_status;
        switch(status) {
          case 'Requested':
            return <StatusIndicator  statusType='info'>Requested</StatusIndicator>;
          case 'Approved':
            return <StatusIndicator  statusType='positive'>Approved</StatusIndicator>;
          case 'Rejected':
            return <StatusIndicator  statusType='negative'>Rejected</StatusIndicator>;
          case 'Expired':
            return <StatusIndicator statusType='negative'>Expired</StatusIndicator>;
          case 'Ended':
            return <StatusIndicator statusType='negative'>Ended</StatusIndicator>;
          default:
            return null;
        }
      }

      return row.id;
    }
  },
  {
    id: 'request_time',
    width: 150,
    Header: 'Requested Time',
    accessor: 'request_time'
  },
  {
    id: 'expiration_time',
    width: 150,
    Header: 'Expiration Time',
    accessor: 'expiration_time'
  }
];

const ReviewedTable: FunctionComponent = () => {

  const userInfo = useSelector( (state:ReduxRoot) => {
    return state.breakGlassReducerState.userInfo
  });

  const [requests, setRequests] = useState<IRequest[]>([]);
  const [selectedItems, setSelectedItems] = useState<object[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = React.useState<FlashbarMessage[]>([]);

  useEffect( () => {
    const getAllRequests = async () => {
      try {

        setLoading(true);

        let requests = await getProcessedRequests(userInfo.token).then(
            (result: IRequest[]) => {
              return result;
            });

        setRequests(requests)

        await Promise.resolve();
        // }
        setLoading(false);
      }
      catch (err) {
        console.log(err.toString());
        const items:FlashbarMessage[] = [
          {
            header: 'Could not get the reviewed requests: ' + err.toString(),
            type: 'error',
            dismissible: true,
          }
        ];
        setErrors(items);
      }
    }
    getAllRequests().then(() => console.log("getProcessedRequests() completed."));
  }, [userInfo]);

  const handleSelectionChange = (items: object[]) => {
    if (!(selectedItems.length === 0 && items.length === 0)) {
      setSelectedItems(items);
    }
  };

  return <div><Table
      onSelectionChange={handleSelectionChange}
      tableTitle={'Requests already reviewed'}
      columnDefinitions={columnDefinitions}
      items={requests}
      loading={loading}
      // actionGroup={tableActions}
      multiSelect={false}
  />
    <Flashbar items={errors} />
  </div>
}


export default ReviewedTable;