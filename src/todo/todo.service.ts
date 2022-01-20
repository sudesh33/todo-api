import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TodoEntity, TodoStatus} from "../Entity/todo.entity";
import {Repository} from "typeorm";
import {CreateTodoDto} from "../DTO/create-todo.dto";
import {UserEntity} from "../Entity/user.entity";

@Injectable()
export class TodoService {

    constructor(@InjectRepository (TodoEntity) private repo:Repository<TodoEntity>) {
    }

    async getAllTodos(user:UserEntity) {

        const query = await  this.repo.createQueryBuilder('todo');
        query.where(`todo.userID = :userID`,{userID: user.id});

        try {
            return await query.getMany();

        }catch (err) {
            throw new NotFoundException('No todo found');
        }
    }

    async createTodo(createTodoDTO: CreateTodoDto,user:UserEntity) {
        const todo= new TodoEntity();
        const {title,description}= createTodoDTO;
        todo.title= title;
        todo.description=description;
        todo.status=TodoStatus.OPEN;
        todo.userId=user.id;

        this.repo.create(todo);
        return await this.repo.save(todo);
    }

    async update(id: number, status: TodoStatus, user:UserEntity) {
        const todo = await this.repo.findOne({id});
        todo.status = status;

        try {
            await this.repo.update({id,userId:user.id},{status});
            return this.repo.findOne({id});
        }catch (err) {
            throw new InternalServerErrorException('Something Went Wrong');
        }
    }

    async delete(id: number, user:UserEntity) {
        const result = await this.repo.delete({id, userId:user.id})

        if(result.affected===0){
            throw  new NotFoundException('Todo not deleted.');
        }else {
            return {success:true};
        }

    }
}
