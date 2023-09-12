import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { prisma } from './prisma_client/index';
import { ScriptConfig } from '@prisma/client';
import { inspect } from 'util';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('TRANSPORT') private transport: ClientProxy) {}

  async onModuleInit() {
    await prisma.$connect();
    // Connect your client to the NATS server on startup.
    await this.transport.connect();
  }

  async createScriptAccountOrFind(account_id: string) {
    const acc = await prisma.account.create({
      data: {
        uniqueId: account_id,
      },
    });

    console.log('account created', acc);
  }

  async getAccountScripts(account_id: string) {
    const account_scripts = await prisma.account.findFirst({
      where: {
        uniqueId: account_id,
      },
      select: {
        Script: true,
      },
    });
    console.log('account_scripts', account_scripts);
    return account_scripts.Script;
  }

  async addScriptToAcccount(
    account_id: string,
    script_id: string,
    script: string,
    name: string,
    description: string,
    version: number,
    config: {
      methods: string[];
      required_headers: string[];
      wait_for_script_end: boolean;
    },
    script_arguments: object,
  ) {
    const account = await prisma.account.findFirst({
      where: {
        uniqueId: account_id,
      },
    });
    console.log('addScriptToAcccount', 'find account', account);
    console.log('addScriptToAcccount', 'config', config);

    const created_script = await prisma.script.create({
      data: {
        enable: true,
        uniqueId: script_id,
        name,
        description,
        version,
        script_arguments: JSON.stringify(script_arguments),
        scriptJSON: script,
        account: {
          connect: {
            id: account.id,
          },
        },
        config: {
          create: {
            allowedMethods: config.methods,
            requiredHeaders: config.required_headers,
            waitForScriptEnd: config.wait_for_script_end,
          },
        },
      },
    });

    console.log('addScriptToAcccount', 'find account', created_script);

    return { route: account.uniqueId + '/' + created_script.uniqueId };
  }

  async allRequestsService(req_info: {
    headers: any;
    query: any;
    body: any;
    account_id: string;
    script_id: string;
    method: string;
    cookies: any;
  }) {
    console.log('REQ_INFO', req_info);
    const data = await prisma.account.findFirst({
      where: {
        uniqueId: req_info.account_id,
      },
      select: {
        Script: {
          where: {
            id: Number(req_info.script_id),
          },
          select: {
            enable: true,
            scriptJSON: true,
            script_arguments: true,
            config: true,
          },
        },
      },
    });

    // console.log(
    //   'const data = await prisma.account.findFirst({',
    //   inspect(data, true, 8),
    // );

    function checkAllowedMethod() {
      return data.Script[0].config.allowedMethods.includes(req_info.method);
    }

    console.log('data.Script[0].', data.Script[0]);
    console.log(
      'data.Script[0].config.allowedMethods',
      data.Script[0].config.allowedMethods,
      'req_info.method',
      req_info.method,
    );

    if (!data.Script[0].enable) throw new NotFoundException();
    console.log('checkAllowedMethod()', checkAllowedMethod());
    if (!checkAllowedMethod()) throw new NotFoundException();

    function checkRequiredHeadersValues() {
      if (data.Script[0].config.requiredHeaders.length === 0) return true;
      const required_headers_array = data.Script[0].config.requiredHeaders.map(
        (header) => header.split(':'),
      );
      const request_header_array = Object.entries(req_info.headers);

      const count = request_header_array.reduce((acc, [key, val]) => {
        const find_val = required_headers_array.find(
          ([r_key, r_val]) => r_key === key && r_val === val,
        );
        if (find_val) return acc + 1;
        return acc;
      }, 0);

      return count === data.Script[0].config.requiredHeaders.length - 1;
    }

    if (!checkRequiredHeadersValues()) throw new NotFoundException();

    const transport_method = data.Script[0].config.waitForScriptEnd
      ? 'send'
      : 'emit';

    console.log('data.Script[0].scriptJSON', data.Script[0].scriptJSON);

    const parsed_script = JSON.parse(data.Script[0].scriptJSON as string);
    // const parsed_script = data.Script[0].scriptJSON as Record<string, any>;
    const script_arguments = data.Script[0].script_arguments as string;

    parsed_script.trigger_info = {};
    parsed_script.trigger_info['webhook-trigger'] = req_info;

    // return this.transport[transport_method](
    return this.transport['send']('script-kernel.create-script-process', {
      blockCallSchema: parsed_script,
      is_testingMode: false,
      script_arguments: JSON.parse(script_arguments),
    });

    // return of(req_info);
  }

  async setEnableTo(script_id: number, enable: boolean) {
    await prisma.script.update({
      where: {
        id: script_id,
      },
      data: {
        enable,
      },
    });
  }

  async onModuleDestroy() {
    await prisma.$disconnect();
    await this.transport.close();
  }
}
