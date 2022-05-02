import { Injectable } from '@nestjs/common';
import { InjectModel } from "nestjs-typegoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { TopLevelCategory, TopPageModel } from "./top-page.model";
import { CreateTopPageDto } from "./dto/create-top-page.dto";

@Injectable()
export class TopPageService {

	constructor(@InjectModel(TopPageModel) private readonly topPageModel: ModelType<TopPageModel>) {}

	async create(dto: CreateTopPageDto){
		return this.topPageModel.create(dto);
	}

	async findById(id: String){
		return this.topPageModel.findById(id).exec();
	}

	async findByAlias(alias: String){
		return this.topPageModel.findOne( {alias} ).exec();
	}

	async findByCategory(firstCategory: TopLevelCategory) {
		return this.topPageModel.find( {firstCategory}, { alias:1, secondCategory:1, title:1 } ).exec();
	}

	async deleteById(id: String){
		return this.topPageModel.findByIdAndRemove(id).exec();
	}

	async updateById(id: String, dto: CreateTopPageDto){
		return this.topPageModel.findByIdAndUpdate(id, dto, { new: true }).exec();
	}

}
