import React from 'react';
import {Button, Dropdown, Navbar} from "react-bootstrap";
import * as board from"./Board"

function BoardHeader(board) {
    return (
        <>
        <Navbar className="navbar-expand-lg navbar-dark bg-black mt-0 pt-0 ">
            <div className="container-fluid">
                <a data-aos="fade-left" data-aos-delay="50" className="navbar-brand" href="/">Scrum Board</a>


                <div className="d-flex mt-3">


                    <Button data-aos="fade-right" data-aos-delay="50" variant="warning"
                            onClick={() => board.setShowTaskModal(true)}>
                        <i className="fas fa-plus"></i> Add card
                    </Button>

                    <Button data-aos="fade-right" data-aos-delay="50" variant="warning"
                            onClick={() => board.setShowMemberModal(true)} className="mx-2">
                        <i className="fas fa-plus"></i> Add a new team members
                    </Button>


                    <Button data-aos="fade-right" data-aos-delay="50" className="btn btn-dark" onClick={board.handleShow}>
                        <i className="fas fa-filter mx-2"></i>Filter
                    </Button>


                    <Dropdown className="mx-2">
                        <Dropdown.Toggle variant="dark" id="dropdown-filter">
                            <i className="fas fa-sort"></i> Sort
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => board.handleSortByTitle('all')}>All</Dropdown.Item>
                            <Dropdown.Item onClick={() => board.handleSortByTitle('A..Z')}>A..Z</Dropdown.Item>
                            <Dropdown.Item onClick={() => board.handleSortByTitle('Z..A')}>Z..A</Dropdown.Item>
                            <Dropdown.Item onClick={() => board.handleSortByDate('des')}>New</Dropdown.Item>
                            <Dropdown.Item onClick={() => board.handleSortByDate('asc')}>Old</Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => board.handleSortByExDate('asc')}>Exdate/ascending</Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => board.handleSortByExDate('des')}>Exdate/descending</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                </div>

            </div>
        </Navbar>





</>
)
    ;
}

export default BoardHeader;