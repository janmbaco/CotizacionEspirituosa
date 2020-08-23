import {Injectable} from '@angular/core';
import {StatusServiceClient} from '../../../domain/services/status_service_pb_service';
import {StatusRequest, StatusResponse} from '../../../domain/models/status_pb';
import { grpc } from '@improbable-eng/grpc-web';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private client: StatusServiceClient;

  constructor() {

    this.client = new StatusServiceClient(
      'http://localhost:8081'
    );
  }

  getStatus(): Promise<string>{
    return new Promise<string>((resolve, reject) => this.client.getStatus(new StatusRequest(),
      (error, response: StatusResponse) => error == null ? resolve(response.getStatus()) : reject(error)));
  }
}
