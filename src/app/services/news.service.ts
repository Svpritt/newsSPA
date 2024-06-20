import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'https://api.spaceflightnewsapi.net/v4/articles';
  private filterKeywordsSubject = new BehaviorSubject<string>('');
  filterKeywords$ = this.filterKeywordsSubject.asObservable();
  private currentFilterValue: string = '';


  constructor(private http: HttpClient) { }
  getArticles(limit: number = 100): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?limit=${limit}`).pipe(
      map(response => response.results.map((article: any) => ({
        id: article.id,
        title: article.title,
        date: article.published_at,
        summary: article.summary.length > 100 ? article.summary.substring(0, 97) + '...' : article.summary,
        imageUrl: article.image_url,
        article: article,
      })))
      
    );
    
  }

  setFilterKeywords(keywords: string): void {
    this.currentFilterValue = keywords;
    this.filterKeywordsSubject.next(keywords);
  }

  getCurrentFilterValue(): string {
    return this.currentFilterValue;
  }
  getFilteredArticles(): Observable<any[]> {
    return combineLatest([this.getArticles(), this.filterKeywords$]).pipe(
      map(([articles, keywords]) => {
        if (!keywords || keywords.trim() === '') {
          return articles; // return all articles if no keywords are provided
        }
        
        const searchTerms = keywords.toLowerCase().split(' ').filter(term => !!term.trim());
        
        return articles.filter(article => {
          const titleMatches = this.checkMatches(article.title, searchTerms);
          const summaryMatches = this.checkMatches(article.summary, searchTerms);
          
          return titleMatches || summaryMatches;
        }).map(article => ({
          ...article,
          title: this.highlightMatches(article.title, searchTerms),
          summary: this.highlightMatches(article.summary, searchTerms)
        })).sort((a, b) => {
          const aTitleMatch = this.checkMatches(a.title, searchTerms);
          const bTitleMatch = this.checkMatches(b.title, searchTerms);
          
          if (aTitleMatch && !bTitleMatch) return -1; 
          if (!aTitleMatch && bTitleMatch) return 1;
          
          const aSummaryMatch = this.checkMatches(a.summary, searchTerms);
          const bSummaryMatch = this.checkMatches(b.summary, searchTerms);
          
          if (aSummaryMatch && !bSummaryMatch) return -1; 
          if (!aSummaryMatch && bSummaryMatch) return 1;
          
          return 0; 
        });
      })
    );
  }
  
  private checkMatches(text: string, searchTerms: string[]): boolean {
    if (!text || !searchTerms.length) {
      return false;
    }
    
    const lowerText = text.toLowerCase();
    return searchTerms.some(term => lowerText.includes(term));
  }

  private highlightMatches(text: string, searchTerms: string[]): string {
    if (!text || !searchTerms.length) {
      return text;
    }

    const pattern = new RegExp(`(${searchTerms.join('|')})`, 'gi');
    return text.replace(pattern, '<mark style="background-color: yellow">$1</mark>');
  }
  
  getArticle(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(article => ({
        id: article.id,
        title: article.title,
        date: article.published_date,
        summary: article.summary,
        imageUrl: article.image_url,
        news_site: article.news_site,
        content: article.content,
      }))
    );
  }
}
