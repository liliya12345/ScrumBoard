import React, {useEffect} from 'react';
import {Dropdown, Card} from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";

function TaskCard(props) {
    useEffect(() => {
        AOS.init({
            duration: 2000,
            easing: "ease-out-cubic",
        });
    }, []);
    return (
        <>
            <Card key={props.card.id}
                  className="kanban-card card mb-2 d-flex"
                  draggable
                  onDragStart={() => props.handleDragStart(props.card.id, props.columnId)}>
                <Card.Body>
                    <div className="d-flex justify-content-between">
                        <Card.Title data-aos="fade-right" data-aos-delay="50">
                            <div  data-aos="fade-right" data-aos-delay="50" className="pt-4" style={{ color:`#${Math.floor(Math.random()*0x777777 + 0x888888).toString(16)}`}}>
                                {props.card.category}
                            </div>

                        </Card.Title>
                        <Dropdown className="mx-2 my-3 ">
                            <Dropdown.Toggle variant="light" style={{border: 'none'}}
                                             show={false}>
                                <i className="fa fa-ellipsis-h"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() => props.handleEdit(props.card.id)}>Edit</Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => props.handleDelete(props.card.id)}>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                    </div>
                    <Card.Text>
                        <div>
                            <h3 data-aos="fade-right" data-aos-delay="50">{props.card.title}</h3>
                        </div>
                        <div >{props.card.description}</div>
                        <div  >Owner: {props.card.owner}</div>
                        <div className="d-flex justify-content-between">
                            <small className="text-muted" >Created: {props.card.createDate}</small>
                            <small className="text-muted">Until: {props.card.dueDate}</small>
                            <span className={`badge ${
                                props.card.priority === 'high' ? 'bg-danger' :
                                    props.card.priority === 'medium' ? 'bg-warning text-dark' : 'bg-success'
                            }`}>
                    {props.card.priority === 'high' ? 'High' :
                        props.card.priority === 'medium' ? 'Medium' : 'Low'}
                </span>
                        </div>
                    </Card.Text>
                </Card.Body>
            </Card>

        </>
    );
}

export default TaskCard;