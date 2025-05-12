
import React, { useState } from 'react';
import { features, getFeatureStats } from '@/lib/features';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const FeatureTrackingList = () => {
  const [filter, setFilter] = useState<'all' | 'implemented' | 'inProgress' | 'notStarted'>('all');
  const stats = getFeatureStats();
  
  const getFilteredFeatures = () => {
    if (filter === 'all') return features;
    if (filter === 'implemented') return features.filter(f => f.implemented);
    if (filter === 'inProgress') return features.filter(f => f.inProgress && !f.implemented);
    if (filter === 'notStarted') return features.filter(f => !f.implemented && !f.inProgress);
    return features;
  };
  
  const getFeatureIcon = (feature: typeof features[0]) => {
    if (feature.implemented) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (feature.inProgress) return <Clock className="h-5 w-5 text-amber-500" />;
    return <XCircle className="h-5 w-5 text-gray-400" />;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Implementation Progress</CardTitle>
        <CardDescription>
          Tracking status of all required features
        </CardDescription>
        
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Implementation Progress</span>
            <span className="font-medium">{stats.percentComplete}%</span>
          </div>
          <Progress value={stats.percentComplete} className="h-2" />
          
          <div className="flex flex-wrap gap-3 pt-2 text-sm">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
              <span>Implemented: {stats.implemented}</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-amber-500 mr-1"></div>
              <span>In Progress: {stats.inProgress}</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-gray-300 mr-1"></div>
              <span>Not Started: {stats.notStarted}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({features.length})</TabsTrigger>
            <TabsTrigger value="implemented">Implemented ({stats.implemented})</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="notStarted">Not Started ({stats.notStarted})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="divide-y">
              {getFilteredFeatures().map((feature) => (
                <div key={feature.id} className="py-3">
                  <div className="flex items-start gap-3">
                    {getFeatureIcon(feature)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feature.id}</span>
                        <h3 className="font-semibold">{feature.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                      {feature.notes && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3 mt-0.5" />
                          <span>{feature.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="implemented" className="mt-0">
            <div className="divide-y">
              {getFilteredFeatures().map((feature) => (
                <div key={feature.id} className="py-3">
                  <div className="flex items-start gap-3">
                    {getFeatureIcon(feature)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feature.id}</span>
                        <h3 className="font-semibold">{feature.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                      {feature.notes && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3 mt-0.5" />
                          <span>{feature.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="inProgress" className="mt-0">
            <div className="divide-y">
              {getFilteredFeatures().map((feature) => (
                <div key={feature.id} className="py-3">
                  <div className="flex items-start gap-3">
                    {getFeatureIcon(feature)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feature.id}</span>
                        <h3 className="font-semibold">{feature.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                      {feature.notes && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3 mt-0.5" />
                          <span>{feature.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="notStarted" className="mt-0">
            <div className="divide-y">
              {getFilteredFeatures().map((feature) => (
                <div key={feature.id} className="py-3">
                  <div className="flex items-start gap-3">
                    {getFeatureIcon(feature)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feature.id}</span>
                        <h3 className="font-semibold">{feature.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                      {feature.notes && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3 mt-0.5" />
                          <span>{feature.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FeatureTrackingList;
