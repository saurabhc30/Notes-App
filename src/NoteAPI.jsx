import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import "./App.css";
import Main from "./main/Main";
import Sidebar from "./sidebar/Sidebar";
import NoteContext from "./Context/Notes/noteContext";

const NoteAPI = (props) => {
    const host = "http://localhost:5000"
    const notesInitial = []
    const [notes, setNotes] = useState(notesInitial);
    const [activeNote, setActiveNote] = useState(false);

    useEffect(() => {
        const getNotes = async () => {
            // API Call 
            const response = await fetch(`${host}/api/notes/fetchallnotes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjQ2ZjkxMzhjNGQyZmI0MmMwMTA2NGU0In0sImlhdCI6MTY4NTAzMzI3Mn0.f-dKiyTugNzLsKftkIDwYtBylKCzFA3UQO6r7H1yvvs"
                }
            });
            const json = await response.json()
            console.log(json);
            setNotes(json)
        }
    }, []);

    const onAddNote = () => {
        const newNote = {
            id: uuidv4(),
            title: "Untitled Note",
            body: "",
            lastModified: Date.now(),
        };

        setNotes([newNote, ...notes]);
        setActiveNote(newNote.id);
    };

    const onDeleteNote = (noteId) => {
        setNotes(notes.filter(({ id }) => id !== noteId));
    };

    const onUpdateNote = (updatedNote) => {
        const updatedNotesArr = notes.map((note) => {
            if (note.id === updatedNote.id) {
                return updatedNote;
            }

            return note;
        });

        setNotes(updatedNotesArr);
    };

    const getActiveNote = () => {
        return notes.find(({ id }) => id === activeNote);
    };

    return (
        <NoteContext.Provider value={{ notes, onAddNote, activeNote, setActiveNote, onDeleteNote, onUpdateNote}}>
            {props.children}
        </NoteContext.Provider>
        // <NoteContext.Provider value={{ notes, onAddNote, activeNote, setActiveNote, onDeleteNote, onUpdateNote }}>
        //   {props.children}
        // </NoteContext.Provider>
    );
}

export default NoteAPI;
