import React, { useEffect, useState, useMemo } from 'react';
import ContentEdit from './ContentEdit';
import Modal from 'react-modal';
import { useTable, useGlobalFilter } from 'react-table';
import { generateClient } from 'aws-amplify/api';
import { listContents } from '../graphql/queries';
import { deleteContent } from '../graphql/mutations';
import { updateContent } from '../graphql/mutations';


function ContentList() {
    const client = generateClient();

    const [contents, setContents] = useState([]);
    const [filterInput, setFilterInput] = useState("");
    const [editingContent, setEditingContent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchContents = async () => {
        const contentData = await client.graphql({query: listContents});
        setContents(contentData.data.listContents.items);
    };

    useEffect(() => {
        fetchContents();
    }, []);

    const handleToggleStatus = async (content) => {
        if (!content || !content.contentID) {
            console.error("Invalid content object or contentID is missing.");
            return;
        }
    
        const newStatus = !content.activeStatus;
        try {
            await client.graphql({
                query: updateContent,
                variables: {
                    input: {
                        id: content.id,
                        contentID: content.contentID, // Assuming 'contentID' is the correct identifier field
                        title: content.title,
                        activeStatus: newStatus      // The new status to be updated
                    }
                }
            });
            // Update the content in the state with the new status
            setContents(prevContents =>
                prevContents.map(item =>
                    item.contentID === content.contentID ? { ...item, activeStatus: newStatus } : item
                )
            );
            alert(`Content ${newStatus ? 'approved' : 'denied'} successfully!`);
        } catch (error) {
            console.error('Error updating content status:', error);
            alert('Failed to update content status. Please check the console for more details.');
        }
    };
    

    const handleDelete = async (id) => {
        try {
            // Optimistically update the UI to remove the deleted item
            setContents(prevContents => prevContents.filter(content => content.id !== id));
            await client.graphql({ query: deleteContent, variables: { input: { id } } });
            alert('Content deleted successfully!');
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Failed to delete content. Please check the console for more details.');
        }
    };

    const handleEdit = (content) => {
        setEditingContent(content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingContent(null);
    };

    const data = useMemo(() => contents, [contents]);

    const columns = useMemo(() => [
        { Header: 'Title', accessor: 'title' },
        { Header: 'Description', accessor: 'description' },
        { Header: 'Status', accessor: 'activeStatus', Cell: ({ cell }) => (
            <button onClick={() => handleToggleStatus(cell.row.original)} className="approve-btn">
                {cell.value ? 'Approve' : 'Deny'}
            </button>
        )},
        { Header: 'Actions', Cell: ({ row }) => (
            <div>
                <button onClick={() => handleEdit(row.original)} className="edit-btn">Edit</button>
                <button onClick={() => handleDelete(row.original.id)} className="delete-btn">Delete</button>
            </div>
        )}
    ], []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setGlobalFilter,
    } = useTable({ columns, data }, useGlobalFilter);

    const handleFilterChange = e => {
        const value = e.target.value || undefined;
        setGlobalFilter(value);
        setFilterInput(value);
    };

    return (
        <div className="ContentList">
            <input
                value={filterInput}
                onChange={handleFilterChange}
                placeholder={"Search title"}
            />
            <table {...getTableProps()} style={{ width: "100%" }}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Edit Content"
            >
                {editingContent && <ContentEdit content={editingContent} onClose={closeModal} />}
            </Modal>
        </div>
    );
}

export default ContentList;
