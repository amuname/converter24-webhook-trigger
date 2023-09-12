import {
  Controller,
  All,
  // HostParam,
  // Ip,
  Headers,
  Query,
  Body,
  Req,
  Param,
} from '@nestjs/common';
// import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { Request } from 'express';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ScriptConfig } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('webhook_trigger.all_request_controller')
  allRequestContoller(payload: {
    headers;
    query;
    body;
    account_id;
    script_id;
    version;
    method;
    cookies;
  }) {
    return this.appService.allRequestsService(payload);
  }
  // @All(':account_id/:script_id')
  // allRequestsController(
  //   // @HostParam() host,
  //   // @Ip() ip,
  //   @Headers() headers,
  //   @Query() query,
  //   @Body() body,
  //   @Param('account_id') account_id: string,
  //   @Param('script_id') script_id: string,
  //   @Param('version') version: number,
  //   @Req() req: Request,
  // ) {
  //   const method = req.method;
  //   const cookies = req.cookies;
  //   // const cookies = req;
  //   const req_info = {
  //     // host,
  //     // ip,
  //     headers,
  //     query,
  //     body,
  //     account_id,
  //     script_id,
  //     version,
  //     method,
  //     cookies,
  //   };
  //   return this.appService.allRequestsService(req_info);
  // }

  @EventPattern({ evt: 'account_service.account_created' })
  async createUser(@Payload('account_id') account_id: string) {
    console.log('@Payload: ', account_id);
    // TO DO
    return await this.appService.createScriptAccountOrFind(account_id);
  }

  @MessagePattern('webhook_trigger.add_script')
  addScriptToAcccount(
    @Payload('account_id') account_id: string,
    @Payload('name') name: string,
    @Payload('description') description: string,
    @Payload('version') version: number,
    @Payload('script_id') script_id,
    @Payload('script') script,
    @Payload('config')
    config: {
      methods: string[];
      required_headers: string[];
      wait_for_script_end: boolean;
    },
    @Payload('script_arguments') script_arguments: any,
  ) {
    console.log('webhook_trigger.add_script', account_id);

    return this.appService.addScriptToAcccount(
      account_id,
      script_id,
      script,
      name,
      description,
      version,
      config,
      script_arguments,
    );
  }

  @MessagePattern('webhook_trigger.get_account_scripts')
  async getAccountScripts(@Payload('account_id') account_id: string) {
    console.log('@Payload: ', account_id);
    // TO DO
    return await this.appService.getAccountScripts(account_id);
  }

  @MessagePattern('webhook_trigger.set_enable_to')
  async setEnbleTo(
    @Payload('script_id') script_id: number,
    @Payload('enable') enable: boolean,
  ) {
    // console.log('@Payload: ', account_id);
    // TO DO
    return await this.appService.setEnableTo(script_id, enable);
  }
}
