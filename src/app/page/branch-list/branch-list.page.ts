import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../../service/auth.service';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';
import {Branch} from '../../model/branch';

export const callback = map((items: any) => items.map(a => {
  const data = a.payload.doc.data() as Branch;
  const id = a.payload.doc.id;
  return {id, ...data};
}));

@Component({
  selector: 'app-branch-list',
  templateUrl: './branch-list.page.html',
  styleUrls: ['./branch-list.page.scss'],
})
export class BranchListPage implements OnInit {

  items: Observable<any[]>;

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private authService: AuthService
  ) {
    this.items = afs.collection('branch',
      q => q.where('owner', '==', this.authService.getAuthInfo().email)
    ).snapshotChanges(['added', 'removed']).pipe(callback);
  }

  ngOnInit() {
  }

}
