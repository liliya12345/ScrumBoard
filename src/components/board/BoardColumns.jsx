import React from 'react';
import TaskCard from "../TaskCard";

function BoardColumns(props) {
    return (
        <>
            <div className="container-main mt-3 pt-0">
                <div className="container-fluid mt-0 theme">
                    <div className="row ">
                        {Object.entries(props.columns).map(([columnId, column]) => (
                            <div
                                key={columnId}
                                className="col-md-4"
                                onDragOver={props.handleDragOver}
                                onDrop={() => props.handleDrop(columnId)}
                            >
                                <div className="kanban-column ">
                                    <div
                                        className="column-title d-flex justify-content-between align-items-center opacity-100">
                                        <span>{column.title}</span>
                                        <span className="badge bg-primary rounded-pill">{column.cards.length}</span>
                                    </div>

                                    {column.cards.map(card => (
                                        <div data-aos="fade-left" data-aos-delay="50">
                                            <TaskCard
                                                card={card}
                                                handleDragStart={props.handleDragStart}
                                                columnId={columnId}
                                                handleEdit={props.handleEdit}
                                                handleDelete={props.handleDelete}
                                            />
                                        </div>


                                    ))}


                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BoardColumns;