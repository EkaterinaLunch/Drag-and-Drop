import { Project, ProjectStatus } from "../models/project";
//Project State Managment
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunc: Listener<T>) {
        this.listeners.push(listenerFunc);
    }
}

export class ProjectState extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance
        }

        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active,
        )
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listenerFuns of this.listeners) {
            listenerFuns(this.projects.slice())
        }
    }
}

export const projectState = ProjectState.getInstance(); //  We guarantee to always work with exact same object and will always have one object of the type in the entire application 
