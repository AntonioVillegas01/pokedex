import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from "mongoose";
import { Pokemon } from "./entities/pokemon.entity";
import { InjectModel } from "@nestjs/mongoose";
import { PaginationDto } from "../common/DTO/pagination.dto";

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ) {
  }
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase()

    try{
      const pokemon = await  this.pokemonModel.create(createPokemonDto);
      return pokemon;

    }catch (error) {
      this.handleExceptions(error)
    }


  }

  findAll(paginationDto:PaginationDto) {

     const {limit =10, offset = 0} = paginationDto

    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no:1
      })
      .select('-__v')
  }

  async findOne(term: string) {

    let pokemon: Pokemon;

    // si id NO es un numero
    if( !isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term})
    }
    // verificar por MONGOID
    if( !pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term)
    }

    // verificar por NAME
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()})
    }

    if(!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)

    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term)
    if( updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase()
    }
    try{
      await  pokemon.updateOne(updatePokemonDto, {new:true})

      return {
        ...pokemon.toJSON(), ...updatePokemonDto
      };

    }catch (error) {

      this.handleExceptions(error)
    }




  }

  async remove(id: string) {

    /*
    se hacen dos consultas a la BD
    * */
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return id
    // const result = await this.pokemonModel.findByIdAndDelete( id )

    const {acknowledged, deletedCount } = await  this.pokemonModel.deleteOne({_id: id})

    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon with id ${id} not found`)
    }


    return ;

  }


  private handleExceptions(error:any) {
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon already exists in db ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can´t create pokemon - Check server logs `)

  }
}
