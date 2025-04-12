import { Injectable } from '@nestjs/common';
import EventEmitter = require('events');
import { CustomEventEmitter } from 'src/core/common/emitter';

import {
  EFileProcessorEvents,
  IProcessIncomingFileAttrs,
} from 'src/lib/file_processors/index.type';

@Injectable()
export class TriggerService {
  private eventEmitter: EventEmitter = CustomEventEmitter;

  constructor() {}

  public emitEvent(
    eventName: EFileProcessorEvents,
    params: IProcessIncomingFileAttrs,
  ) {
    this.eventEmitter.emit(eventName, params);
  }
}
