import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable, map } from 'rxjs';


interface ClassConstructor {
  new(...args: any[]): {}
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}


// take an object and serialize it into JSON

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) { }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    // Run something before a request is handled
    // by the request handler

    return next.handle().pipe(
      // runs handler (@Get) from controller
      map((data: any) => {
        // running before the response is sent out
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        })
      })
    )
  }
}