import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { CustomEventEmitter } from 'src/core/common/emitter';

import { IProcessIncomingFileAttrs, ProcessWebpage } from '../events.type';
import { EFileProcessorEvents } from '../events.enum';

@Injectable()
export class TriggerService {
  private eventEmitter: EventEmitter = CustomEventEmitter;

  constructor() {}

  public emitEvent(
    eventName: EFileProcessorEvents,
    params: IProcessIncomingFileAttrs | ProcessWebpage,
  ) {
    this.eventEmitter.emit(eventName, params);
  }
}
